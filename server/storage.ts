import { users, User, InsertUser, contests, Contest, InsertContest, problems, Problem, InsertProblem, submissions, Submission, InsertSubmission, contestParticipants, ContestParticipant, InsertContestParticipant } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User | undefined>;
  
  // Contest operations
  getContests(): Promise<Contest[]>;
  getContest(id: number): Promise<Contest | undefined>;
  getActiveContests(): Promise<Contest[]>;
  createContest(contest: InsertContest): Promise<Contest>;
  updateContest(id: number, contest: Partial<InsertContest>): Promise<Contest | undefined>;
  deleteContest(id: number): Promise<boolean>;
  
  // Problem operations
  getProblems(contestId: number): Promise<Problem[]>;
  getProblem(id: number): Promise<Problem | undefined>;
  createProblem(problem: InsertProblem): Promise<Problem>;
  
  // Submission operations
  getSubmissions(userId: number): Promise<Submission[]>;
  getSubmissionsByProblem(problemId: number): Promise<Submission[]>;
  getSubmissionsByContest(contestId: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  
  // Contest Participation operations
  registerForContest(participation: InsertContestParticipant): Promise<ContestParticipant>;
  getContestParticipants(contestId: number): Promise<ContestParticipant[]>;
  getUserContests(userId: number): Promise<ContestParticipant[]>;
  updateContestScore(userId: number, contestId: number, score: number): Promise<ContestParticipant | undefined>;
  
  // Leaderboard operations
  getLeaderboard(): Promise<User[]>;
  getContestLeaderboard(contestId: number): Promise<ContestParticipant[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private contestsData: Map<number, Contest>;
  private problemsData: Map<number, Problem>;
  private submissionsData: Map<number, Submission>;
  private contestParticipantsData: Map<number, ContestParticipant>;
  
  sessionStore: session.SessionStore;
  
  private userId: number = 1;
  private contestId: number = 1;
  private problemId: number = 1;
  private submissionId: number = 1;
  private participantId: number = 1;

  constructor() {
    this.usersData = new Map();
    this.contestsData = new Map();
    this.problemsData = new Map();
    this.submissionsData = new Map();
    this.contestParticipantsData = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add sample admin user
    this.createUser({
      username: "admin",
      password: "password", // This will be hashed by auth.ts
      email: "admin@algo-arena.com",
      fullName: "Admin User",
      role: "admin"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, points: 0, problemsSolved: 0 };
    this.usersData.set(id, user);
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      points: user.points + points,
      problemsSolved: user.problemsSolved + 1
    };
    this.usersData.set(userId, updatedUser);
    return updatedUser;
  }

  // Contest operations
  async getContests(): Promise<Contest[]> {
    return Array.from(this.contestsData.values());
  }
  
  async getContest(id: number): Promise<Contest | undefined> {
    return this.contestsData.get(id);
  }
  
  async getActiveContests(): Promise<Contest[]> {
    const now = new Date();
    return Array.from(this.contestsData.values()).filter(
      (contest) => new Date(contest.startTime) <= now && new Date(contest.endTime) >= now
    );
  }
  
  async createContest(contest: InsertContest): Promise<Contest> {
    const id = this.contestId++;
    const newContest: Contest = { ...contest, id };
    this.contestsData.set(id, newContest);
    return newContest;
  }
  
  async updateContest(id: number, contest: Partial<InsertContest>): Promise<Contest | undefined> {
    const existingContest = await this.getContest(id);
    if (!existingContest) return undefined;
    
    const updatedContest = { ...existingContest, ...contest };
    this.contestsData.set(id, updatedContest);
    return updatedContest;
  }
  
  async deleteContest(id: number): Promise<boolean> {
    return this.contestsData.delete(id);
  }

  // Problem operations
  async getProblems(contestId: number): Promise<Problem[]> {
    return Array.from(this.problemsData.values()).filter(
      (problem) => problem.contestId === contestId
    );
  }
  
  async getProblem(id: number): Promise<Problem | undefined> {
    return this.problemsData.get(id);
  }
  
  async createProblem(problem: InsertProblem): Promise<Problem> {
    const id = this.problemId++;
    const newProblem: Problem = { ...problem, id };
    this.problemsData.set(id, newProblem);
    return newProblem;
  }

  // Submission operations
  async getSubmissions(userId: number): Promise<Submission[]> {
    return Array.from(this.submissionsData.values()).filter(
      (submission) => submission.userId === userId
    );
  }
  
  async getSubmissionsByProblem(problemId: number): Promise<Submission[]> {
    return Array.from(this.submissionsData.values()).filter(
      (submission) => submission.problemId === problemId
    );
  }
  
  async getSubmissionsByContest(contestId: number): Promise<Submission[]> {
    return Array.from(this.submissionsData.values()).filter(
      (submission) => submission.contestId === contestId
    );
  }
  
  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const id = this.submissionId++;
    const now = new Date();
    const newSubmission: Submission = { 
      ...submission, 
      id, 
      submittedAt: now 
    };
    this.submissionsData.set(id, newSubmission);
    
    // Update user points if submission is accepted
    if (submission.status === 'Accepted') {
      await this.updateUserPoints(submission.userId, submission.score);
      await this.updateContestScore(submission.userId, submission.contestId, submission.score);
    }
    
    return newSubmission;
  }

  // Contest Participation operations
  async registerForContest(participation: InsertContestParticipant): Promise<ContestParticipant> {
    const id = this.participantId++;
    const now = new Date();
    const newParticipation: ContestParticipant = { 
      ...participation, 
      id, 
      registeredAt: now, 
      score: 0,
      rank: null
    };
    this.contestParticipantsData.set(id, newParticipation);
    return newParticipation;
  }
  
  async getContestParticipants(contestId: number): Promise<ContestParticipant[]> {
    return Array.from(this.contestParticipantsData.values()).filter(
      (participant) => participant.contestId === contestId
    );
  }
  
  async getUserContests(userId: number): Promise<ContestParticipant[]> {
    return Array.from(this.contestParticipantsData.values()).filter(
      (participant) => participant.userId === userId
    );
  }
  
  async updateContestScore(userId: number, contestId: number, score: number): Promise<ContestParticipant | undefined> {
    const participant = Array.from(this.contestParticipantsData.values()).find(
      p => p.userId === userId && p.contestId === contestId
    );
    
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, score: participant.score + score };
    this.contestParticipantsData.set(participant.id, updatedParticipant);
    
    // Recalculate ranks for this contest
    const participants = await this.getContestParticipants(contestId);
    const sortedParticipants = participants.sort((a, b) => b.score - a.score);
    
    sortedParticipants.forEach((p, index) => {
      const withRank = { ...p, rank: index + 1 };
      this.contestParticipantsData.set(p.id, withRank);
    });
    
    return updatedParticipant;
  }

  // Leaderboard operations
  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.usersData.values())
      .filter(user => user.role === 'student')
      .sort((a, b) => b.points - a.points);
  }
  
  async getContestLeaderboard(contestId: number): Promise<ContestParticipant[]> {
    const participants = await this.getContestParticipants(contestId);
    return participants.sort((a, b) => b.score - a.score);
  }
}

export const storage = new MemStorage();
