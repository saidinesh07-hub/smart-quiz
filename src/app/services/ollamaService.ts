import axios from 'axios';

// Use relative path for Vite dev proxy
// (configured in vite.config.ts to forward /api -> http://localhost:3001)
const API_BASE_URL = '/api';

export interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
}

export interface AIResponse {
  success: boolean;
  response?: string;
  question?: QuizQuestion;
  evaluation?: {
    isCorrect: boolean;
    feedback: string;
  };
  error?: string;
  model?: string;
}

/**
 * Generate a quiz question using Google Gemini AI
 * Replaces Ollama with cloud-based AI API
 */
export const generateQuizQuestion = async (
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<AIResponse> => {
  try {
    console.log(`🎯 Requesting ${difficulty} question on: ${topic}`);

    const response = await axios.post(
      `${API_BASE_URL}/ai-question`,
      { topic, difficulty },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Question generated successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error generating question:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to generate question'
    };
  }
};

/**
 * Send a custom prompt to the AI
 */
export const sendPrompt = async (prompt: string): Promise<AIResponse> => {
  try {
    console.log('📤 Sending custom prompt to AI');

    const response = await axios.post(
      `${API_BASE_URL}/ai-prompt`,
      { prompt },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Prompt processed successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error processing prompt:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to process prompt'
    };
  }
};

/**
 * Check if the AI server is available
 */
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000
    });
    console.log('✅ Server is healthy');
    return response.data.status === 'OK';
  } catch (error) {
    console.error('❌ Server not available:', error);
    return false;
  }
};

/**
 * Generate multiple quiz questions at once
 */
export const generateMultipleQuestions = async (
  topic: string,
  count: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<QuizQuestion[]> => {
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    console.log(`📝 Generating question ${i + 1}/${count}...`);
    const response = await generateQuizQuestion(topic, difficulty);

    if (response.success && response.question) {
      questions.push(response.question);
    } else {
      console.error(`Failed to generate question ${i + 1}:`, response.error);
    }
  }

  return questions;
};

/**
 * DEPRECATED: Kept for backwards compatibility
 * Evaluating answers is now handled client-side with the question data
 */
export const evaluateAnswer = async (
  question: string,
  correctAnswer: string,
  userAnswer: string,
  explanation?: string
): Promise<AIResponse> => {
  // Simple client-side evaluation
  const isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();
  
  return {
    success: true,
    evaluation: {
      isCorrect,
      feedback: isCorrect
        ? `✅ Correct! ${explanation || 'Well done!'}`
        : `❌ Incorrect. The correct answer is ${correctAnswer}. ${explanation || ''}`
    }
  };
};
