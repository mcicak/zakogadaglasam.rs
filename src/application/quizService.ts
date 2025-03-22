import { Question, UserResponse, QuizResult } from '@/domain/types';
import { PartyRepository } from '@/data/repositories';

export class QuizService {
  private partyRepository: PartyRepository;
  private readonly DIMENSIONS = ['economic', 'social', 'nationalism', 'traditionalism', 'regionalism'];

  constructor() {
    this.partyRepository = new PartyRepository();
  }

  calculatePosition(questions: Question[], responses: UserResponse[]): number[] {
    // Initialize coordinates array for our fixed 5 dimensions
    const coordinates = new Array(this.DIMENSIONS.length).fill(0);
    const weights = new Array(this.DIMENSIONS.length).fill(0);

    // Calculate weighted average for each dimension
    responses.forEach(response => {
      const question = questions.find(q => q.id === response.questionId);
      if (!question) return;

      const dimensionIndex = this.DIMENSIONS.indexOf(question.dimension);
      if (dimensionIndex === -1) return;

      // Convert 1-5 scale to -2 to 2 scale
      const normalizedAnswer = (response.answer - 3);
      
      coordinates[dimensionIndex] += normalizedAnswer * question.weight;
      weights[dimensionIndex] += question.weight;
    });

    // Normalize coordinates, ensuring we don't divide by zero
    return coordinates.map((coord, i) => {
      // Ensure at least some weight exists to avoid division by zero
      if (weights[i] === 0) return 0;
      
      // Normalize and cap values between -2 and 2
      const normalizedCoord = coord / weights[i];
      return Math.max(-2, Math.min(2, normalizedCoord));
    });
  }

  async getResult(questions: Question[], responses: UserResponse[]): Promise<QuizResult> {
    const coordinates = this.calculatePosition(questions, responses);
    
    // Get all parties and find the closest one
    const parties = await this.partyRepository.getParties();
    
    let closestParty = parties[0];
    let minDistance = Infinity;

    for (const party of parties) {
      // Calculate Euclidean distance in 5D space
      const distance = this.calculateDistance(coordinates, party.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        closestParty = party;
      }
    }
    
    // Calculate similarity score (1 - normalized distance)
    // Maximum possible distance in 5D space with each dimension ranging from -2 to 2
    const maxPossibleDistance = Math.sqrt(5 * 16); // 5 dimensions, max distance per dimension is 4^2 = 16
    const similarityScore = 1 - (minDistance / maxPossibleDistance);

    return {
      coordinates,
      matchedParty: closestParty,
      similarityScore
    };
  }

  calculateDistance(coord1: number[], coord2: number[]): number {
    return Math.sqrt(
      coord1.reduce((sum, val, i) => sum + Math.pow(val - coord2[i], 2), 0)
    );
  }
} 