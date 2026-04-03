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

// Session tracking to prevent duplicate questions
const sessionQuestions = new Map<string, Set<string>>();

function getSessionKey(topic: string, difficulty: string): string {
  return `${topic.toLowerCase()}:${difficulty.toLowerCase()}`;
}

function trackQuestion(topic: string, difficulty: string, questionText: string): void {
  const key = getSessionKey(topic, difficulty);
  if (!sessionQuestions.has(key)) {
    sessionQuestions.set(key, new Set());
  }
  // Hash the entire question for better tracking
  const hash = Buffer.from(questionText).toString('base64');
  sessionQuestions.get(key)!.add(hash);
  console.log(`✅ Tracked question for ${key}. Total tracked: ${sessionQuestions.get(key)!.size}`);
}

function isQuestionDuplicate(topic: string, difficulty: string, questionText: string): boolean {
  const key = getSessionKey(topic, difficulty);
  if (!sessionQuestions.has(key)) {
    return false;
  }
  const hash = Buffer.from(questionText).toString('base64');
  const isDupe = sessionQuestions.get(key)!.has(hash);
  if (isDupe) {
    console.warn(`⚠️ DUPLICATE DETECTED: "${questionText.substring(0, 50)}..."`);
  }
  return isDupe;
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
 * Pre-shuffles questions to ensure diversity
 */
const fallbackQuestionPool = new Map<string, any[]>();
const fallbackQuestionIndex = new Map<string, number>();

function initializeFallbackPool(topic: string, difficulty: string, candidates: any[]) {
  const key = getSessionKey(topic, difficulty);
  if (!fallbackQuestionPool.has(key)) {
    // Create a shuffled copy once per topic/difficulty
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    fallbackQuestionPool.set(key, shuffled);
    fallbackQuestionIndex.set(key, 0);
    console.log(`📚 Initialized fallback pool for ${key} with ${shuffled.length} questions`);
  }
}

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

  // Initialize or retrieve pre-shuffled pool
  initializeFallbackPool(topic, difficulty, candidates);
  
  const key = getSessionKey(topic, difficulty);
  const pool = fallbackQuestionPool.get(key)!;
  let currentIndex = fallbackQuestionIndex.get(key) ?? 0;
  
  // Get next question in sequence from the pool
  const chosen = pool[currentIndex % pool.length];
  
  // Increment for next call
  fallbackQuestionIndex.set(key, (currentIndex + 1) % pool.length);
  
  console.log(`📝 Fallback: Using pre-shuffled question ${(currentIndex % pool.length) + 1}/${pool.length} for ${key}`);

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

app.post('/api/ai-question', async (req: Request, res: Response) => {
  let topic = '';
  let normalizedDifficulty = 'medium';
  let retryCount = 0;
  const maxRetries = 3;

  async function generateQuestion(): Promise<any> {
    try {
      const bodyTopic = (req.body.topic || '').toString();
      const bodyDifficulty = (req.body.difficulty || 'medium').toString();

      topic = bodyTopic;
      normalizedDifficulty = bodyDifficulty.toLowerCase();

      if (!topic || !topic.trim()) {
        return { error: 'Topic is required', hasError: true };
      }

      // Validate difficulty
      const validDifficulties = ['easy', 'medium', 'hard'];
      
      if (!validDifficulties.includes(normalizedDifficulty)) {
        return { error: 'Difficulty must be one of: easy, medium, hard', hasError: true };
      }

      console.log(`🎯 Generating ${normalizedDifficulty} question for topic: "${topic}" (attempt ${retryCount + 1})`);

      if (!genAI) {
        const fallback = getFallbackQuestion(topic, normalizedDifficulty);
        if (fallback) {
          console.warn('⚠️ No Gemini client available, using local fallback question.');
          return { success: true, question: fallback, model: 'fallback-local', hasError: false };
        }
        return { error: 'Gemini unavailable, and no fallback question available', hasError: true };
      }

      // Create the prompt for Gemini with STRICT uniqueness enforcement
      const timestamp = Date.now();
      const randomSalt = Math.random().toString(36).substring(7);
      const prompt = `CRITICAL: Generate a BRAND NEW, NEVER SEEN BEFORE multiple choice question.

Topic: ${topic}
Difficulty: ${normalizedDifficulty}

MANDATORY REQUIREMENTS:
1. Create a COMPLETELY ORIGINAL question NOT a repeat of any standard question
2. Use a SPECIFIC, UNIQUE angle or aspect of ${topic}
3. Avoid generic, commonly asked questions
4. Make the question DISTINCTIVE and MEMORABLE
5. All options must be clearly different with one obvious correct answer
6. The question must have a clear, unambiguous correct answer

Examples of POOR questions to AVOID:
- "What is the capital of France?" (too generic)
- "What is the chemical symbol for gold?" (too standard)
- "What year did World War II end?" (too basic)

Instead, create ORIGINAL questions like:
- "What unusual material did ancient Romans use for concrete that made it stronger over time?"
- "Which element has a boiling point closest to absolute zero?"
- "What overlooked strategy contributed to the success of the Blitzkrieg?"

Generate ONLY valid JSON (no text before or after):
{
  "question": "Your unique, specific question here",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correctAnswer": "A",
  "explanation": "Why this is correct and interesting"
}

Request ID: ${timestamp}-${randomSalt} (for uniqueness verification)`;

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

        // Check for duplicates with retry logic
        if (isQuestionDuplicate(topic, normalizedDifficulty, questionData.question)) {
          console.warn(`\n⚠️ ⚠️ ⚠️ DUPLICATE DETECTED ⚠️ ⚠️ ⚠️`);
          console.warn(`Question: "${questionData.question.substring(0, 60)}..."`);
          console.warn(`Attempt: ${retryCount + 1}/${maxRetries}`);
          console.warn(`Retrying with new request...\n`);
          
          if (retryCount < maxRetries) {
            retryCount++;
            return await generateQuestion();
          } else {
            console.error('❌ MAX RETRIES REACHED - Could not generate a unique question');
            console.error('Falling back to fallback question pool');
            const fallback = getFallbackQuestion(topic, normalizedDifficulty);
            if (fallback) {
              trackQuestion(topic, normalizedDifficulty, fallback.question);
              return { success: true, question: fallback, model: 'fallback-local-max-retries', hasError: false };
            }
            return { error: 'Could not generate unique question after retries', hasError: true };
          }
        }

        // Track the question if it's unique
        console.log(`✅ ✅ ✅ UNIQUE QUESTION GENERATED ✅ ✅ ✅`);
        console.log(`Question: "${questionData.question.substring(0, 60)}..."`);
        console.log(`Model: Gemini\n`);
        trackQuestion(topic, normalizedDifficulty, questionData.question);

        return { success: true, question: questionData, model: 'gemini-pro', hasError: false };
      } catch (parseError: any) {
        console.error('❌ Failed to parse response:', text, parseError);
        const fallback = getFallbackQuestion(topic, normalizedDifficulty);
        if (fallback) {
          console.warn('⚠️ Parsing failed, returning fallback local question.');
          trackQuestion(topic, normalizedDifficulty, fallback.question);
          return { success: true, question: fallback, model: 'fallback-local', hasError: false };
        }

        return { error: 'Failed to parse AI response', hasError: true, details: parseError.message };
      }

    } catch (error: any) {
      console.error('❌ Error generating question:', error);

      const errMsg = (error?.message || '').toString().toLowerCase();
      const errStatus = error?.status || error?.statusCode || null;

      if (errMsg.includes('api_key') || errMsg.includes('unauthorized') || errStatus === 401) {
        const fallback = getFallbackQuestion(topic, normalizedDifficulty);
        if (fallback) {
          console.warn('⚠️ Gemini key invalid/missing; returning fallback local question');
          trackQuestion(topic, normalizedDifficulty, fallback.question);
          return { success: true, question: fallback, model: 'fallback-local', hasError: false };
        }

        return { 
          error: 'Invalid or missing API key', 
          hasError: true,
          details: 'Please check your GEMINI_API_KEY environment variable in .env and ensure the key is valid and enabled for the Generative AI API' 
        };
      }

      if (errMsg.includes('quota') || errMsg.includes('429') || errStatus === 429) {
        const fallback = getFallbackQuestion(topic, normalizedDifficulty);
        if (fallback) {
          console.warn('⚠️ Gemini rate-limited; returning fallback local question');
          trackQuestion(topic, normalizedDifficulty, fallback.question);
          return { success: true, question: fallback, model: 'fallback-local', hasError: false };
        }

        return { error: 'API rate limit exceeded', hasError: true, details: 'Please try again in a moment' };
      }

      // Returning fallback for other AI errors
      const fallback = getFallbackQuestion(topic, normalizedDifficulty);
      if (fallback) {
        console.warn('⚠️ Gemini call failed, returning fallback local question', error);
        trackQuestion(topic, normalizedDifficulty, fallback.question);
        return { success: true, question: fallback, model: 'fallback-local', hasError: false };
      }

      return { 
        error: 'Failed to generate question', 
        hasError: true,
        message: error?.message || 'Unknown error' 
      };
    }
  }

  try {
    const result = await generateQuestion();
    
    if (result.hasError) {
      if (result.error === 'Topic is required') {
        return res.status(400).json({ error: result.error, success: false });
      }
      if (result.error === 'Difficulty must be one of: easy, medium, hard') {
        return res.status(400).json({ error: result.error, success: false });
      }
      if (result.error === 'Gemini unavailable, and no fallback question available') {
        return res.status(503).json({ error: result.error, success: false });
      }
      if (result.error === 'Invalid or missing API key') {
        return res.status(401).json({ error: result.error, success: false, details: result.details });
      }
      if (result.error === 'API rate limit exceeded') {
        return res.status(429).json({ error: result.error, success: false, details: result.details });
      }
      if (result.error === 'Failed to parse AI response') {
        return res.status(502).json({ error: result.error, success: false, details: result.details });
      }
      return res.status(500).json(result);
    }
    
    return res.json(result);
  } catch (error: any) {
    console.error('❌ Unhandled error in AI question endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      success: false,
      message: error.message
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

/**
 * Clear session cache - call this when starting a fresh quiz session
 * POST /api/clear-cache
 */
app.post('/api/clear-cache', (req: Request, res: Response) => {
  const topic = req.body.topic || 'all';
  
  if (topic === 'all') {
    sessionQuestions.clear();
    fallbackQuestionPool.clear();
    fallbackQuestionIndex.clear();
    console.log('\n🗑️ 🗑️ 🗑️ CLEARED ALL SESSION CACHES 🗑️ 🗑️ 🗑️\n');
  } else {
    // Clear all difficulty levels for this topic
    const difficulties = ['easy', 'medium', 'hard'];
    let cleared = 0;
    for (const diff of difficulties) {
      const key = getSessionKey(topic, diff);
      if (sessionQuestions.has(key)) {
        sessionQuestions.delete(key);
        cleared++;
      }
      if (fallbackQuestionPool.has(key)) {
        fallbackQuestionPool.delete(key);
      }
      if (fallbackQuestionIndex.has(key)) {
        fallbackQuestionIndex.delete(key);
      }
    }
    console.log(`\n🗑️ CLEARED CACHE FOR TOPIC: ${topic} (${cleared} difficulty levels)\n`);
  }
  
  return res.json({
    success: true,
    message: `Cleared cache for ${topic}`,
    timestamp: new Date().toISOString()
  });
});
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
  console.log('   POST /api/ai-question - Generate a quiz question (with duplicate detection)');
  console.log('   POST /api/ai-prompt - Send a custom prompt');
  console.log('   POST /api/clear-cache - Clear session duplicate cache');
  console.log('   GET /api/health - Health check');
  console.log('\n💡 Duplicate Detection ENABLED - Each question is checked before delivery\n');
});
