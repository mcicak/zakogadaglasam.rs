export interface Question {
  id: string;
  text: string;
  dimension: string;
  weight: number;
}

export interface Party {
  id: string;
  name: string;
  description: string;
  coordinates: number[];
}

export interface UserResponse {
  questionId: string;
  answer: number; // 1-5
}

export interface QuizResult {
  coordinates: number[];
  matchedParty: Party;
  similarityScore: number;
} 