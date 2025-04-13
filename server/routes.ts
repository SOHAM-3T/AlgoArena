import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertContestSchema, insertProblemSchema, insertSubmissionSchema, insertContestRegistrationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  setupAuth(app);

  // Contest routes
  app.get("/api/contests", async (req, res) => {
    const contests = await storage.getContests();
    res.json(contests);
  });

  app.get("/api/contests/active", async (req, res) => {
    const contests = await storage.getActiveContests();
    res.json(contests);
  });

  app.get("/api/contests/upcoming", async (req, res) => {
    const contests = await storage.getUpcomingContests();
    res.json(contests);
  });

  app.get("/api/contests/past", async (req, res) => {
    const contests = await storage.getPastContests();
    res.json(contests);
  });

  app.get("/api/contests/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid contest ID" });
    
    const contest = await storage.getContest(id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    
    res.json(contest);
  });

  app.post("/api/contests", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    
    try {
      const contestData = insertContestSchema.parse(req.body);
      const contest = await storage.createContest({
        ...contestData,
        createdBy: req.user.id
      });
      res.status(201).json(contest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/contests/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid contest ID" });
    
    try {
      const contest = await storage.getContest(id);
      if (!contest) return res.status(404).json({ message: "Contest not found" });
      
      const updatedContest = await storage.updateContest(id, req.body);
      res.json(updatedContest);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Problem routes
  app.get("/api/contests/:contestId/problems", async (req, res) => {
    const contestId = parseInt(req.params.contestId);
    if (isNaN(contestId)) return res.status(400).json({ message: "Invalid contest ID" });
    
    const problems = await storage.getProblemsForContest(contestId);
    res.json(problems);
  });

  app.get("/api/problems/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid problem ID" });
    
    const problem = await storage.getProblem(id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    
    res.json(problem);
  });

  app.post("/api/problems", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    
    try {
      const problemData = insertProblemSchema.parse(req.body);
      const problem = await storage.createProblem(problemData);
      res.status(201).json(problem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Submission routes
  app.get("/api/submissions/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const submissions = await storage.getSubmissionsForUser(req.user.id);
    res.json(submissions);
  });

  app.get("/api/submissions/problem/:problemId", async (req, res) => {
    const problemId = parseInt(req.params.problemId);
    if (isNaN(problemId)) return res.status(400).json({ message: "Invalid problem ID" });
    
    const submissions = await storage.getSubmissionsForProblem(problemId);
    res.json(submissions);
  });

  app.get("/api/submissions/contest/:contestId", async (req, res) => {
    const contestId = parseInt(req.params.contestId);
    if (isNaN(contestId)) return res.status(400).json({ message: "Invalid contest ID" });
    
    const submissions = await storage.getSubmissionsForContest(contestId);
    res.json(submissions);
  });

  app.post("/api/submissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const { problemId, contestId, code, language } = req.body;
      
      // Basic validation
      if (!problemId || !contestId || !code || !language) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if user is registered for the contest
      const isRegistered = await storage.isUserRegisteredForContest(req.user.id, contestId);
      if (!isRegistered) {
        return res.status(403).json({ message: "You are not registered for this contest" });
      }
      
      // In a real implementation, we would run and evaluate the code here
      // For now, we'll randomly decide if the submission is accepted
      const statuses = ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const submission = await storage.createSubmission({
        userId: req.user.id,
        problemId,
        contestId,
        code,
        language,
        status: randomStatus,
      });
      
      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Contest Registration routes
  app.post("/api/contests/:contestId/register", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const contestId = parseInt(req.params.contestId);
    if (isNaN(contestId)) return res.status(400).json({ message: "Invalid contest ID" });
    
    try {
      // Check if contest exists
      const contest = await storage.getContest(contestId);
      if (!contest) return res.status(404).json({ message: "Contest not found" });
      
      // Check if already registered
      const isRegistered = await storage.isUserRegisteredForContest(req.user.id, contestId);
      if (isRegistered) {
        return res.status(400).json({ message: "Already registered for this contest" });
      }
      
      const registration = await storage.registerForContest({
        userId: req.user.id,
        contestId,
      });
      
      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Analytics routes for admin
  app.get("/api/analytics/submissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const submissions = await storage.getRecentSubmissions(limit);
    res.json(submissions);
  });

  app.get("/api/analytics/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    
    // In a real implementation, this would calculate statistics about users
    // For now, just return all users
    const users = Array.from((storage as any).users.values());
    
    // Remove passwords before sending
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.json(safeUsers);
  });

  const httpServer = createServer(app);
  return httpServer;
}
