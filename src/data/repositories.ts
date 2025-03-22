import { supabase } from './supabase';
import { Question, Party } from '@/domain/types';

export interface IQuestionRepository {
  getQuestions(): Promise<Question[]>;
}

export interface IPartyRepository {
  getParties(): Promise<Party[]>;
  findClosestParty(coordinates: number[]): Promise<Party>;
}

export class QuestionRepository implements IQuestionRepository {
  async getQuestions(): Promise<Question[]> {
    // Get a balanced set of questions from all dimensions
    const dimensions = ['economic', 'social', 'nationalism', 'traditionalism', 'regionalism'];
    const questionsPerDimension = Math.ceil(20 / dimensions.length); // ~4 questions per dimension
    
    // Fetch questions for each dimension
    const questionsPromises = dimensions.map(dimension => {
      return supabase
        .from('questions')
        .select('*')
        .eq('dimension', dimension)
        .order('created_at', { ascending: false }) // prefer newer questions if available
        .limit(questionsPerDimension);
    });
    
    const results = await Promise.all(questionsPromises);
    
    // Combine and handle any errors
    const allQuestions: Question[] = [];
    results.forEach(({ data, error }, index) => {
      if (error) {
        console.error(`Error fetching ${dimensions[index]} questions:`, error);
        return;
      }
      if (data) {
        allQuestions.push(...data as Question[]);
      }
    });
    
    // Shuffle the questions
    return this.shuffleArray(allQuestions).slice(0, 20);
  }
  
  // Fisher-Yates shuffle algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

export class PartyRepository implements IPartyRepository {
  async getParties(): Promise<Party[]> {
    const { data, error } = await supabase
      .from('parties')
      .select('*');

    if (error) throw error;
    return data as Party[];
  }

  async findClosestParty(coordinates: number[]): Promise<Party> {
    const { data, error } = await supabase
      .from('parties')
      .select('*');

    if (error) throw error;

    const parties = data as Party[];
    let closestParty = parties[0];
    let minDistance = Infinity;

    for (const party of parties) {
      const distance = this.calculateDistance(coordinates, party.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        closestParty = party;
      }
    }

    return closestParty;
  }

  private calculateDistance(vec1: number[], vec2: number[]): number {
    return Math.sqrt(
      vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0)
    );
  }
} 