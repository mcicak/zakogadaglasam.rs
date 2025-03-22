'use client';

import { useState, useEffect } from 'react';
import { Question, UserResponse, QuizResult, Party } from '@/domain/types';
import { QuestionRepository, PartyRepository } from '@/data/repositories';
import { QuizService } from '@/application/quizService';

// Likert scale options with proper labels in Serbian
const OPTIONS = [
  { value: 1, label: 'Potpuno se ne slažem' },
  { value: 2, label: 'Uglavnom se ne slažem' },
  { value: 3, label: 'Nisam siguran' },
  { value: 4, label: 'Uglavnom se slažem' },
  { value: 5, label: 'Potpuno se slažem' }
];

// Dimension names for display
const DIMENSION_NAMES = {
  'economic': 'Ekonomija',
  'social': 'Društvo',
  'nationalism': 'Nacionalizam',
  'traditionalism': 'Tradicija',
  'regionalism': 'Regionalizacija'
};

// Dimension explanations
const DIMENSION_EXPLANATIONS = {
  'economic': 'Od -2 (državna kontrola) do 2 (slobodno tržište)',
  'social': 'Od -2 (autoritarno) do 2 (libertarijansko)',
  'nationalism': 'Od -2 (globalistički, pro-EU) do 2 (nacionalistički, suverenistički)',
  'traditionalism': 'Od -2 (progresivno) do 2 (tradicionalno)',
  'regionalism': 'Od -2 (centralizovano) do 2 (decentralizovano)'
};

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [allParties, setAllParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const repo = new QuestionRepository();
        const questions = await repo.getQuestions();
        setQuestions(questions);
        setTotalQuestions(questions.length);
        setLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => {
    // Update progress percentage
    if (totalQuestions > 0) {
      setProgressPercent(Math.floor((currentQuestion / totalQuestions) * 100));
    }
  }, [currentQuestion, totalQuestions]);

  const handleAnswer = (answer: number) => {
    const newResponses = [
      ...responses,
      { questionId: questions[currentQuestion].id, answer }
    ];
    setResponses(newResponses);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newResponses);
    }
  };

  const calculateResult = async (finalResponses: UserResponse[]) => {
    const quizService = new QuizService();
    const result = await quizService.getResult(questions, finalResponses);
    
    // Get all parties and sort them by relevance
    const partyRepo = new PartyRepository();
    const parties = await partyRepo.getParties();
    const sortedParties = [...parties].sort((a, b) => {
      const distanceA = quizService.calculateDistance(result.coordinates, a.coordinates);
      const distanceB = quizService.calculateDistance(result.coordinates, b.coordinates);
      return distanceA - distanceB;
    });
    
    setAllParties(sortedParties);
    setResult(result);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-primary">Učitavanje pitanja...</div>
      </div>
    );
  }

  if (result) {
    // Calculate positions for both 2D compasses
    const compass1X = ((result.coordinates[0] + 2) / 4) * 100; // economic dimension
    const compass1Y = ((result.coordinates[1] + 2) / 4) * 100; // social dimension
    const compass2X = ((result.coordinates[2] + 2) / 4) * 100; // nationalism dimension
    const compass2Y = ((result.coordinates[3] + 2) / 4) * 100; // traditionalism dimension

    return (
      <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-primary">Vaša Politička Pozicija</h1>
        
        {/* First Political Compass - Economic vs Social */}
        <div className="card p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Ekonomija vs Društvo</h2>
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* Background grid */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              <div className="border-r border-b border-[var(--card-border)]"></div>
              <div className="border-b border-[var(--card-border)]"></div>
              <div className="border-r border-[var(--card-border)]"></div>
              <div></div>
            </div>
            
            {/* Axes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-[var(--card-border)]"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-full bg-[var(--card-border)]"></div>
            </div>
            
            {/* Labels */}
            <div className="absolute -top-6 left-0 text-sm text-secondary">Autoritarno</div>
            <div className="absolute -top-6 right-0 text-sm text-secondary">Libertarijansko</div>
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 text-sm text-secondary">Levo</div>
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 text-sm text-secondary">Desno</div>
            
            {/* User position */}
            <div 
              className="absolute w-4 h-4 bg-[var(--accent)] rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${compass1X}%`, 
                top: `${100 - compass1Y}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Second Political Compass - Nationalism vs Traditionalism */}
        <div className="card p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Nacionalizam vs Tradicionalizam</h2>
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* Background grid */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              <div className="border-r border-b border-[var(--card-border)]"></div>
              <div className="border-b border-[var(--card-border)]"></div>
              <div className="border-r border-[var(--card-border)]"></div>
              <div></div>
            </div>
            
            {/* Axes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-[var(--card-border)]"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-full bg-[var(--card-border)]"></div>
            </div>
            
            {/* Labels */}
            <div className="absolute -top-6 left-0 text-sm text-secondary">Progresivno</div>
            <div className="absolute -top-6 right-0 text-sm text-secondary">Tradicionalno</div>
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 text-sm text-secondary">Globalistički</div>
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 text-sm text-secondary">Nacionalistički</div>
            
            {/* User position */}
            <div 
              className="absolute w-4 h-4 bg-[var(--accent)] rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${compass2X}%`, 
                top: `${100 - compass2Y}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Matched Party */}
        <div className="card p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Vaša Politička Stranka</h2>
          <div className="p-4 bg-[var(--accent)]/10 rounded-md mb-4">
            <p className="text-xl font-bold mb-2 text-primary">{result.matchedParty.name}</p>
            <p className="text-secondary mb-3">{result.matchedParty.description}</p>
            <div className="mb-2">
              <span className="font-semibold text-primary">Podudaranje:</span>
              <span className="ml-2 font-bold text-[var(--accent)]">{Math.round(result.similarityScore * 100)}%</span>
            </div>
          </div>
        </div>

        {/* All Parties Sorted by Relevance */}
        <div className="card p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Sve stranke prema relevatnosti</h2>
          <div className="space-y-4">
            {allParties.map((party, index) => {
              const distance = Math.sqrt(
                Math.pow(result.coordinates[0] - party.coordinates[0], 2) +
                Math.pow(result.coordinates[1] - party.coordinates[1], 2)
              );
              const similarity = 1 - (distance / 4);
              
              return (
                <div 
                  key={party.id}
                  className={`p-4 rounded-md ${
                    index === 0 
                      ? 'bg-[var(--accent)]/10 border-2 border-[var(--accent)]' 
                      : 'bg-[var(--card-bg)] border border-[var(--card-border)]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-primary">{party.name}</p>
                      <p className="text-sm text-secondary">{party.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--accent)]">
                        {Math.round(similarity * 100)}%
                      </p>
                      <p className="text-xs text-secondary">
                        {index === 0 ? 'Najbolje podudaranje' : `${index + 1}. po podudaranju`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Dimensions with Enhanced Progress Bars */}
        <div className="card p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">Vaše Koordinate</h2>
          <div className="space-y-6">
            {result.coordinates.map((coord, i) => {
              const dimensionKey = Object.keys(DIMENSION_NAMES)[i];
              const dimensionName = DIMENSION_NAMES[dimensionKey as keyof typeof DIMENSION_NAMES];
              const explanation = DIMENSION_EXPLANATIONS[dimensionKey as keyof typeof DIMENSION_EXPLANATIONS];
              const position = ((coord + 2) / 4) * 100;
              
              return (
                <div key={i} className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-primary">{dimensionName}</span>
                    <span className="text-sm text-secondary">{coord.toFixed(1)}</span>
                  </div>
                  <div className="relative h-8 progress-bg rounded-full overflow-hidden">
                    {/* Dashed background */}
                    <div className="absolute inset-0 flex">
                      {[...Array(5)].map((_, index) => (
                        <div 
                          key={index}
                          className="flex-1 border-r border-[var(--card-border)] last:border-r-0"
                        ></div>
                      ))}
                    </div>
                    {/* Progress bar */}
                    <div 
                      className="absolute top-0 bottom-0 progress-fill transition-all duration-300"
                      style={{ width: `${position}%` }}
                    ></div>
                    {/* Dashed overlay */}
                    <div className="absolute inset-0 flex">
                      {[...Array(5)].map((_, index) => (
                        <div 
                          key={index}
                          className="flex-1 border-r border-white/20 last:border-r-0"
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-secondary">-2</span>
                    <span className="text-xs text-secondary">0</span>
                    <span className="text-xs text-secondary">2</span>
                  </div>
                  <p className="text-xs text-secondary mt-2">{explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary py-3 px-6"
          >
            Započni ponovo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="h-2 w-full progress-bg rounded-full">
          <div 
            className="h-2 progress-fill rounded-full transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="text-sm text-secondary mt-2 text-right">
          Pitanje {currentQuestion + 1} od {totalQuestions}
        </div>
      </div>
      
      <div className="card p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">
            {questions[currentQuestion]?.text}
          </h2>
          <p className="text-sm text-secondary">
            Izrazite koliko se slažete sa ovom tvrdnjom:
          </p>
        </div>
        
        <div className="space-y-3">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="w-full text-left p-4 rounded-lg border border-[var(--card-border)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)] transition-colors flex justify-between items-center"
            >
              <span className="text-primary">{option.label}</span>
              <span className="text-secondary">{option.value}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
