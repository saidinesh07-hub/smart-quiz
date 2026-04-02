import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { quizTopics } from './src/app/data/quizData';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini client if key exists
let genAI: GoogleGenerativeAI | null = null;

if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY is not set in environment variables');
  console.warn('   Please set GEMINI_API_KEY in your .env file or as an environment variable');
} else {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ Google Gemini initialized successfully');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Google Gemini:', error);
    genAI = null;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Quiz server is running with Google Gemini',
    timestamp: new Date().toISOString()
  });
});

/**
 * Local fallback for quiz data when Gemini key is invalid/expired
 */
const getFallbackQuestion = (topic: string, difficulty: string) => {
  const normalizedTopic = topic.trim().toLowerCase();
  const normalizedDifficulty = difficulty.toLowerCase();

  let topicMatch = quizTopics.find(
    (t) => t.id.toLowerCase() === normalizedTopic || t.name.toLowerCase() === normalizedTopic
  );

  if (!topicMatch) {
    topicMatch = quizTopics.find((t) => t.name.toLowerCase().includes(normalizedTopic));
  }

  let candidates = topicMatch
    ? topicMatch.questions.filter((q) => q.difficulty === normalizedDifficulty)
    : [];

  if (candidates.length === 0) {
    candidates = quizTopics.flatMap((t) => t.questions.filter((q) => q.difficulty === normalizedDifficulty));
  }

  if (candidates.length === 0) {
    return null;
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return {
    question: chosen.question,
    options: {
      A: chosen.options[0] ?? '',
      B: chosen.options[1] ?? '',
      C: chosen.options[2] ?? '',
      D: chosen.options[3] ?? ''
    },
    correctAnswer: ['A', 'B', 'C', 'D'][chosen.correctAnswer] ?? 'A',
    explanation: `Fallback local question from topic '${topicMatch?.name ?? 'general'}'`,
  };
};

/**
 * Generate a quiz question using Google Gemini
 * POST /api/ai-question
 * Body: { topic: string, difficulty: 'easy' | 'medium' | 'hard' }
 */
app.post('/api/ai-question', async (req: Request, res: Response) => {
  let topic = '';
  let normalizedDifficulty = 'medium';

  try {
    const bodyTopic = (req.body.topic || '').toString();
    const bodyDifficulty = (req.body.difficulty || 'medium').toString();

    topic = bodyTopic;
    normalizedDifficulty = bodyDifficulty.toLowerCase();

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: 'Topic is required',
        success: false
      });
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    
    if (!validDifficulties.includes(normalizedDifficulty)) {
      return res.status(400).json({
        error: 'Difficulty must be one of: easy, medium, hard',
        success: false
      });
    }

    console.log(`🎯 Generating ${normalizedDifficulty} question for topic: "${topic}"`);

    if (!genAI) {
      const fallback = getFallbackQuestion(topic, normalizedDifficulty);
      if (fallback) {
        console.warn('⚠️ No Gemini client available, using local fallback question.');
        return res.json({ success: true, question: fallback, model: 'fallback-local' });
      }
      return res.status(503).json({ error: 'Gemini unavailable, and no fallback question available', success: false });
    }

    // Create the prompt for Gemini
    const prompt = `Generate a multiple choice question on ${topic} with ${normalizedDifficulty} difficulty.
Return ONLY valid JSON (no additional text before or after):
{
  "question": "Clear, specific question text",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correctAnswer": "A",
  "explanation": "Brief explanation of why this is correct"
}`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Received response from Gemini');
    console.log('📄 Raw response (first 200 chars):', text.substring(0, 200));

    // Parse the response - extract JSON if needed
    let questionData;
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionData = JSON.parse(jsonMatch[0]);
      } else {
        questionData = JSON.parse(text);
      }

      // Validate the structure
      if (!questionData.question || !questionData.options || !questionData.correctAnswer) {
        throw new Error('Invalid question structure');
      }
    } catch (parseError: any) {
      console.error('❌ Failed to parse response:', text);
      return res.status(500).json({
        error: 'Failed to parse AI response',
        success: false,
        details: parseError.message
      });
    }

    return res.json({
      success: true,
      question: questionData,
      model: 'gemini-pro'
    });

  } catch (error: any) {
    console.error('❌ Error generating question:', error);

    const errMsg = (error?.message || '').toString().toLowerCase();
    const errStatus = error?.status || error?.statusCode || null;

    if (errMsg.includes('api_key') || errMsg.includes('unauthorized') || errStatus === 401) {
      const fallback = getFallbackQuestion(topic, normalizedDifficulty);
      if (fallback) {
        console.warn('⚠️ Gemini key invalid/missing; returning fallback local question');
        return res.json({
          success: true,
          question: fallback,
          model: 'fallback-local'
        });
      }

      return res.status(401).json({
        error: 'Invalid or missing API key',
        success: false,
        details: 'Please check your GEMINI_API_KEY environment variable in .env and ensure the key is valid and enabled for the Generative AI API'
      });
    }

    if (errMsg.includes('quota') || errMsg.includes('429') || errStatus === 429) {
      const fallback = getFallbackQuestion(topic, normalizedDifficulty);
      if (fallback) {
        console.warn('⚠️ Gemini rate-limited; returning fallback local question');
        return res.json({
          success: true,
          question: fallback,
          model: 'fallback-local'
        });
      }

      return res.status(429).json({
        error: 'API rate limit exceeded',
        success: false,
        details: 'Please try again in a moment'
      });
    }

    // Returning fallback for other AI errors
    const fallback = getFallbackQuestion(topic, normalizedDifficulty);
    if (fallback) {
      console.warn('⚠️ Gemini call failed, returning fallback local question', error);
      return res.json({
        success: true,
        question: fallback,
        model: 'fallback-local'
      });
    }

    return res.status(500).json({
      error: 'Failed to generate question',
      success: false,
      message: error?.message || 'Unknown error'
    });
  }
});

/**
 * Simple endpoint for general prompts (optional, for future use)
 * POST /api/ai-prompt
 * Body: { prompt: string }
 */
app.post('/api/ai-prompt', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: 'Prompt is required',
        success: false
      });
    }

    console.log('📤 Sending custom prompt to Gemini');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({
      success: true,
      response: text,
      model: 'gemini-pro'
    });

  } catch (error: any) {
    console.error('❌ Error processing prompt:', error.message);

    return res.status(500).json({
      error: 'Failed to process prompt',
      success: false,
      message: error.message
    });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    success: false,
    path: req.path
  });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    success: false,
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('📝 Endpoints available:');
  console.log('   POST /api/ai-question - Generate a quiz question');
  console.log('   POST /api/ai-prompt - Send a custom prompt');
  console.log('   GET /api/health - Health check');
});
