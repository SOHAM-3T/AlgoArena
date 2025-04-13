import { users, contests, problems, submissions, contestRegistrations } from "@shared/schema";
import type { User, InsertUser, Contest, InsertContest, Problem, InsertProblem, Submission, InsertSubmission, ContestRegistration, InsertContestRegistration } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Contest methods
  getContest(id: number): Promise<Contest | undefined>;
  getContests(): Promise<Contest[]>;
  getActiveContests(): Promise<Contest[]>;
  getUpcomingContests(): Promise<Contest[]>;
  getPastContests(): Promise<Contest[]>;
  createContest(contest: InsertContest): Promise<Contest>;
  updateContest(id: number, contest: Partial<Contest>): Promise<Contest | undefined>;
  
  // Problem methods
  getProblem(id: number): Promise<Problem | undefined>;
  getProblemsForContest(contestId: number): Promise<Problem[]>;
  createProblem(problem: InsertProblem): Promise<Problem>;
  
  // Submission methods
  getSubmission(id: number): Promise<Submission | undefined>;
  getSubmissionsForUser(userId: number): Promise<Submission[]>;
  getSubmissionsForProblem(problemId: number): Promise<Submission[]>;
  getSubmissionsForContest(contestId: number): Promise<Submission[]>;
  getRecentSubmissions(limit: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  
  // Contest Registration methods
  registerForContest(registration: InsertContestRegistration): Promise<ContestRegistration>;
  isUserRegisteredForContest(userId: number, contestId: number): Promise<boolean>;
  getContestRegistrations(contestId: number): Promise<ContestRegistration[]>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contests: Map<number, Contest>;
  private problems: Map<number, Problem>;
  private submissions: Map<number, Submission>;
  private contestRegistrations: Map<number, ContestRegistration>;
  currentUserId: number;
  currentContestId: number;
  currentProblemId: number;
  currentSubmissionId: number;
  currentRegistrationId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.contests = new Map();
    this.problems = new Map();
    this.submissions = new Map();
    this.contestRegistrations = new Map();
    this.currentUserId = 1;
    this.currentContestId = 1;
    this.currentProblemId = 1;
    this.currentSubmissionId = 1;
    this.currentRegistrationId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add some seed data for development
    this.seedData();
  }

  private seedData() {
    // Seed admin user
    this.createUser({
      username: "admin",
      password: "admin_password", // Will be hashed in auth.ts
      email: "admin@algarena.com",
      fullName: "Admin User",
      role: "admin"
    });
    
    // Seed student user
    this.createUser({
      username: "student",
      password: "student_password", // Will be hashed in auth.ts
      email: "student@algarena.com",
      fullName: "Student User",
      role: "student"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, rating: 1000, problemsSolved: 0, contestsParticipated: 0 };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Contest methods
  async getContest(id: number): Promise<Contest | undefined> {
    return this.contests.get(id);
  }
  
  async getContests(): Promise<Contest[]> {
    return Array.from(this.contests.values());
  }
  
  async getActiveContests(): Promise<Contest[]> {
    const now = new Date();
    return Array.from(this.contests.values()).filter(
      contest => contest.status === "active" || (new Date(contest.startTime) <= now && new Date(contest.endTime) >= now)
    );
  }
  
  async getUpcomingContests(): Promise<Contest[]> {
    const now = new Date();
    return Array.from(this.contests.values()).filter(
      contest => contest.status === "upcoming" || new Date(contest.startTime) > now
    );
  }
  
  async getPastContests(): Promise<Contest[]> {
    const now = new Date();
    return Array.from(this.contests.values()).filter(
      contest => contest.status === "ended" || new Date(contest.endTime) < now
    );
  }
  
  async createContest(insertContest: InsertContest): Promise<Contest> {
    const id = this.currentContestId++;
    const startTime = new Date(insertContest.startTime);
    const endTime = new Date(insertContest.endTime);
    const now = new Date();
    
    let status = "upcoming";
    if (startTime <= now && endTime >= now) {
      status = "active";
    } else if (endTime < now) {
      status = "ended";
    }
    
    const contest: Contest = { ...insertContest, id, status };
    this.contests.set(id, contest);
    return contest;
  }
  
  async updateContest(id: number, contestData: Partial<Contest>): Promise<Contest | undefined> {
    const contest = await this.getContest(id);
    if (!contest) return undefined;
    
    const updatedContest = { ...contest, ...contestData };
    this.contests.set(id, updatedContest);
    return updatedContest;
  }

  // Problem methods
  async getProblem(id: number): Promise<Problem | undefined> {
    return this.problems.get(id);
  }
  
  async getProblemsForContest(contestId: number): Promise<Problem[]> {
    return Array.from(this.problems.values())
      .filter(problem => problem.contestId === contestId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }
  
  async createProblem(insertProblem: InsertProblem): Promise<Problem> {
    const id = this.currentProblemId++;
    const problem: Problem = { ...insertProblem, id };
    this.problems.set(id, problem);
    return problem;
  }

  // Submission methods
  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }
  
  async getSubmissionsForUser(userId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .filter(submission => submission.userId === userId)
      .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime());
  }
  
  async getSubmissionsForProblem(problemId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .filter(submission => submission.problemId === problemId)
      .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime());
  }
  
  async getSubmissionsForContest(contestId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .filter(submission => submission.contestId === contestId)
      .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime());
  }
  
  async getRecentSubmissions(limit: number): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
      .slice(0, limit);
  }
  
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.currentSubmissionId++;
    const now = new Date();
    const submission: Submission = { 
      ...insertSubmission, 
      id, 
      submitTime: now, 
      executionTime: Math.floor(Math.random() * 1000) // Mock execution time
    };
    this.submissions.set(id, submission);
    
    // Update user's problems solved count if the submission is accepted
    if (submission.status === "Accepted") {
      const user = await this.getUser(submission.userId);
      if (user) {
        const userSubmissions = await this.getSubmissionsForUser(user.id);
        const problemsAlreadySolved = new Set(
          userSubmissions
            .filter(s => s.status === "Accepted")
            .map(s => s.problemId)
        );
        
        if (!problemsAlreadySolved.has(submission.problemId)) {
          await this.updateUser(user.id, {
            problemsSolved: user.problemsSolved + 1
          });
        }
      }
    }
    
    return submission;
  }

  // Contest Registration methods
  async registerForContest(insertRegistration: InsertContestRegistration): Promise<ContestRegistration> {
    const id = this.currentRegistrationId++;
    const now = new Date();
    const registration: ContestRegistration = { ...insertRegistration, id, registeredAt: now };
    this.contestRegistrations.set(id, registration);
    
    // Update user's contests participated count
    const user = await this.getUser(insertRegistration.userId);
    if (user) {
      await this.updateUser(user.id, {
        contestsParticipated: user.contestsParticipated + 1
      });
    }
    
    return registration;
  }
  
  async isUserRegisteredForContest(userId: number, contestId: number): Promise<boolean> {
    return Array.from(this.contestRegistrations.values())
      .some(reg => reg.userId === userId && reg.contestId === contestId);
  }
  
  async getContestRegistrations(contestId: number): Promise<ContestRegistration[]> {
    return Array.from(this.contestRegistrations.values())
      .filter(reg => reg.contestId === contestId);
  }
}

export const storage = new MemStorage();
