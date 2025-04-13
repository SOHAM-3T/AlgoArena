// Common types used across the application

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "student" | "admin";
  rating: number;
  problemsSolved: number;
  contestsParticipated: number;
}

export interface Contest {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  difficulty: string;
  createdBy: number;
  status: "upcoming" | "active" | "ended";
}

export interface Problem {
  id: number;
  contestId: number;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  testCases: {
    input: string;
    output: string;
  }[];
  orderIndex: number;
}

export interface Submission {
  id: number;
  userId: number;
  problemId: number;
  contestId: number;
  code: string;
  language: string;
  status: string;
  submitTime: string;
  executionTime?: number;
}

export interface ContestRegistration {
  id: number;
  userId: number;
  contestId: number;
  registeredAt: string;
}

// Utility types
export interface ContestWithProblems extends Contest {
  problems: Problem[];
}

export interface ProblemWithSubmissions extends Problem {
  submissions: Submission[];
}

export interface UserWithStats extends User {
  rank?: number;
  recentSubmissions?: Submission[];
  performanceByCategory?: {
    category: string;
    percentage: number;
  }[];
}
