import React from 'react';
import { cn } from '@/lib/utils';
import { Problem } from '@/types';

interface ProblemListProps {
  problems: Problem[];
  activeProblemId?: number;
  userSolvedProblems?: number[];
  onSelectProblem: (problemId: number) => void;
}

export function ProblemList({ 
  problems, 
  activeProblemId, 
  userSolvedProblems = [], 
  onSelectProblem 
}: ProblemListProps) {
  const getProblemStatus = (problem: Problem) => {
    if (userSolvedProblems.includes(problem.id)) {
      return 'solved';
    }
    return 'unsolved';
  };
  
  const getLetterForIndex = (index: number) => {
    return String.fromCharCode(65 + index);
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
      <div className="p-4 bg-primary-50 border-b border-primary-100">
        <h2 className="font-medium text-primary-800">Problems</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {problems.map((problem, index) => (
          <li key={problem.id}>
            <button
              onClick={() => onSelectProblem(problem.id)}
              className={cn(
                "w-full block px-4 py-3 hover:bg-gray-50 flex items-center justify-between",
                activeProblemId === problem.id && "bg-gray-50"
              )}
            >
              <div className="flex items-center">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-100 text-primary-800 text-sm font-medium">
                  {getLetterForIndex(index)}
                </span>
                <span className="ml-3 text-sm font-medium text-gray-900 truncate">
                  {problem.title}
                </span>
              </div>
              {getProblemStatus(problem) === 'solved' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Solved
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
