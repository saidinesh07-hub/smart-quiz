// Quiz data structure with questions for each topic and difficulty level

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  image?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  color: string;
  questions: Question[];
}

export const quizTopics: Topic[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '📐',
    color: 'from-blue-500 to-cyan-500',
    questions: [
      {
        id: 'math1',
        question: 'What is the value of π (pi) to two decimal places?',
        options: ['3.12', '3.14', '3.16', '3.18'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 'math2',
        question: 'What is the square root of 144?',
        options: ['10', '11', '12', '13'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'math3',
        question: 'If a triangle has angles 90°, 45°, what is the third angle?',
        options: ['30°', '45°', '60°', '90°'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 'math4',
        question: 'What is the derivative of x²?',
        options: ['x', '2x', 'x²', '2'],
        correctAnswer: 1,
        difficulty: 'hard'
      },
      {
        id: 'math5',
        question: 'What is 15% of 200?',
        options: ['25', '30', '35', '40'],
        correctAnswer: 1,
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    color: 'from-green-500 to-emerald-500',
    questions: [
      {
        id: 'sci1',
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'sci2',
        question: 'What is the speed of light in vacuum?',
        options: ['3 × 10⁸ m/s', '3 × 10⁷ m/s', '3 × 10⁹ m/s', '3 × 10⁶ m/s'],
        correctAnswer: 0,
        difficulty: 'medium'
      },
      {
        id: 'sci3',
        question: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'sci4',
        question: 'What is the most abundant gas in Earth\'s atmosphere?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 'sci5',
        question: 'What is the smallest unit of matter?',
        options: ['Molecule', 'Atom', 'Quark', 'Electron'],
        correctAnswer: 2,
        difficulty: 'hard'
      }
    ]
  },
  {
    id: 'technology',
    name: 'Technology & AI',
    icon: '🤖',
    color: 'from-purple-500 to-pink-500',
    questions: [
      {
        id: 'tech1',
        question: 'What does AI stand for?',
        options: ['Automated Intelligence', 'Artificial Intelligence', 'Advanced Internet', 'Algorithmic Integration'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 'tech2',
        question: 'Which company developed ChatGPT?',
        options: ['Google', 'Microsoft', 'OpenAI', 'Meta'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'tech3',
        question: 'What does GPU stand for?',
        options: ['General Processing Unit', 'Graphics Processing Unit', 'Global Processing Unit', 'Game Processing Unit'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 'tech4',
        question: 'What is blockchain primarily used for?',
        options: ['Video editing', 'Distributed ledger', 'Cloud storage', '3D rendering'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 'tech5',
        question: 'What does API stand for?',
        options: ['Application Programming Interface', 'Automated Program Integration', 'Advanced Programming Index', 'Application Process Interface'],
        correctAnswer: 0,
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    icon: '🔐',
    color: 'from-red-500 to-orange-500',
    questions: [
      {
        id: 'cyber1',
        question: 'What does VPN stand for?',
        options: ['Virtual Private Network', 'Very Private Network', 'Virtual Public Network', 'Verified Private Network'],
        correctAnswer: 0,
        difficulty: 'easy'
      },
      {
        id: 'cyber2',
        question: 'What is phishing?',
        options: ['A fishing technique', 'A type of virus', 'A social engineering attack', 'A firewall'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'cyber3',
        question: 'What does HTTPS stand for?',
        options: ['Hyper Text Transfer Protocol Secure', 'High Transfer Text Protocol System', 'Hyper Transfer Text Protocol Secure', 'High Text Transfer Protocol Secure'],
        correctAnswer: 0,
        difficulty: 'medium'
      },
      {
        id: 'cyber4',
        question: 'What is two-factor authentication?',
        options: ['Two passwords', 'Two types of security', 'Two devices', 'Two verification steps'],
        correctAnswer: 3,
        difficulty: 'easy'
      },
      {
        id: 'cyber5',
        question: 'What is ransomware?',
        options: ['Free software', 'Malware that encrypts data', 'A type of firewall', 'An antivirus'],
        correctAnswer: 1,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'general',
    name: 'General Knowledge',
    icon: '🌍',
    color: 'from-yellow-500 to-amber-500',
    questions: [
      {
        id: 'gen1',
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'gen2',
        question: 'How many continents are there?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'gen3',
        question: 'What is the largest ocean on Earth?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correctAnswer: 3,
        difficulty: 'easy'
      },
      {
        id: 'gen4',
        question: 'Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 'gen5',
        question: 'What is the smallest country in the world?',
        options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
        correctAnswer: 1,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'history',
    name: 'History',
    icon: '📜',
    color: 'from-indigo-500 to-blue-500',
    questions: [
      {
        id: 'hist1',
        question: 'In which year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'hist2',
        question: 'Who was the first President of India?',
        options: ['Jawaharlal Nehru', 'Dr. Rajendra Prasad', 'Sardar Patel', 'Dr. B.R. Ambedkar'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 'hist3',
        question: 'When did India gain independence?',
        options: ['1945', '1946', '1947', '1948'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'hist4',
        question: 'Who built the Taj Mahal?',
        options: ['Akbar', 'Shah Jahan', 'Aurangzeb', 'Jahangir'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 'hist5',
        question: 'Which ancient wonder was located in Egypt?',
        options: ['Hanging Gardens', 'Great Pyramid', 'Colossus', 'Lighthouse'],
        correctAnswer: 1,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'politics',
    name: 'Politics',
    icon: '⚖️',
    color: 'from-slate-500 to-gray-500',
    questions: [
      {
        id: 'pol1',
        question: 'How many members are there in the Lok Sabha?',
        options: ['543', '545', '550', '552'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 'pol2',
        question: 'Who is known as the Father of the Indian Constitution?',
        options: ['Mahatma Gandhi', 'Dr. B.R. Ambedkar', 'Jawaharlal Nehru', 'Sardar Patel'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 'pol3',
        question: 'What is the term length for a US President?',
        options: ['2 years', '4 years', '6 years', '8 years'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 'pol4',
        question: 'Which country has the most Nobel Prize winners?',
        options: ['United Kingdom', 'Germany', 'United States', 'France'],
        correctAnswer: 2,
        difficulty: 'hard'
      },
      {
        id: 'pol5',
        question: 'What does UN stand for?',
        options: ['United Nations', 'Universal Nations', 'United Network', 'Universal Network'],
        correctAnswer: 0,
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: '🗺️',
    color: 'from-teal-500 to-green-500',
    questions: [
      {
        id: 'geo1',
        question: 'What is the longest river in the world?',
        options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 'geo2',
        question: 'Which is the largest desert in the world?',
        options: ['Sahara', 'Arabian', 'Gobi', 'Antarctic'],
        correctAnswer: 3,
        difficulty: 'hard'
      },
      {
        id: 'geo3',
        question: 'What is the highest mountain in the world?',
        options: ['K2', 'Mount Everest', 'Kangchenjunga', 'Lhotse'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 'geo4',
        question: 'Which country has the most time zones?',
        options: ['Russia', 'USA', 'China', 'France'],
        correctAnswer: 3,
        difficulty: 'hard'
      },
      {
        id: 'geo5',
        question: 'What is the capital of Australia?',
        options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
        correctAnswer: 2,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: 'from-orange-500 to-red-500',
    questions: [
      {
        id: 'sport1',
        question: 'How many players are in a cricket team?',
        options: ['10', '11', '12', '13'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 'sport2',
        question: 'Who has won the most Olympic gold medals?',
        options: ['Usain Bolt', 'Michael Phelps', 'Carl Lewis', 'Mark Spitz'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 'sport3',
        question: 'Which country won the 2018 FIFA World Cup?',
        options: ['Brazil', 'Germany', 'France', 'Argentina'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'sport4',
        question: 'What is the national sport of India?',
        options: ['Cricket', 'Hockey', 'Football', 'Kabaddi'],
        correctAnswer: 1,
        difficulty: 'medium'
      },
      {
        id: 'sport5',
        question: 'How many Grand Slam tournaments are there in tennis?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: 'from-pink-500 to-rose-500',
    questions: [
      {
        id: 'ent1',
        question: 'Which movie won the Oscar for Best Picture in 2020?',
        options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
        correctAnswer: 2,
        difficulty: 'medium'
      },
      {
        id: 'ent2',
        question: 'Who is known as the "King of Pop"?',
        options: ['Elvis Presley', 'Michael Jackson', 'Prince', 'Freddie Mercury'],
        correctAnswer: 1,
        difficulty: 'easy'
      },
      {
        id: 'ent3',
        question: 'Which streaming platform created "Stranger Things"?',
        options: ['Amazon Prime', 'Disney+', 'Netflix', 'Hulu'],
        correctAnswer: 2,
        difficulty: 'easy'
      },
      {
        id: 'ent4',
        question: 'Who directed "The Dark Knight" trilogy?',
        options: ['Christopher Nolan', 'Zack Snyder', 'James Cameron', 'Steven Spielberg'],
        correctAnswer: 0,
        difficulty: 'medium'
      },
      {
        id: 'ent5',
        question: 'Which band released the album "Abbey Road"?',
        options: ['The Rolling Stones', 'The Beatles', 'Led Zeppelin', 'Pink Floyd'],
        correctAnswer: 1,
        difficulty: 'easy'
      }
    ]
  }
];

// Function to get questions based on difficulty
export const getQuestionsByDifficulty = (topicId: string, difficulty: 'easy' | 'medium' | 'hard') => {
  const topic = quizTopics.find(t => t.id === topicId);
  if (!topic) return [];
  return topic.questions.filter(q => q.difficulty === difficulty);
};

// Function to get all questions for a topic
export const getTopicQuestions = (topicId: string) => {
  const topic = quizTopics.find(t => t.id === topicId);
  return topic?.questions || [];
};
