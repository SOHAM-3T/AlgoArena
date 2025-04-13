import React from 'react';
import { Problem } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ProblemDescriptionProps {
  problem: Problem;
}

export function ProblemDescription({ problem }: ProblemDescriptionProps) {
  // Function to determine difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg mb-6">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{problem.title}</h2>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)} mr-2`}>
              {problem.difficulty}
            </span>
            <span className="text-sm text-gray-500">Time Limit: {problem.timeLimit}s</span>
          </div>
        </div>

        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: problem.description }} />
      </div>
    </div>
  );
}
