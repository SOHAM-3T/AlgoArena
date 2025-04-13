import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertContestSchema, insertProblemSchema, insertSubmissionSchema, insertContestParticipantSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // ----- Contest Routes -----
  app.post("/api/contests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== 'admin') return res.status(403).send("Only admins can create contests");
    
    try {
      const validatedData = insertContestSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const contest = await storage.createContest(validatedData);
      res.status(201).json(contest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create contest" });
      }
    }
  });

  app.get("/api/contests/:id", async (req, res) => {
    try {
      const contestId = parseInt(req.params.id);
      const contest = await storage.getContest(contestId);
      
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }
      
      res.json(contest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contest" });
    }
  });

  app.put("/api/contests/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== 'admin') return res.status(403).send("Only admins can update contests");
    
    try {
      const contestId = parseInt(req.params.id);
      const validatedData = insertContestSchema.partial().parse(req.body);
      
      const updatedContest = await storage.updateContest(contestId, validatedData);
      if (!updatedContest) {
        return res.status(404).json({ error: "Contest not found" });
      }
      
      res.json(updatedContest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update contest" });
      }
    }
  });

  app.delete("/api/contests/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== 'admin') return res.status(403).send("Only admins can delete contests");
    
    try {
      const contestId = parseInt(req.params.id);
      const success = await storage.deleteContest(contestId);
      
      if (!success) {
        return res.status(404).json({ error: "Contest not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contest" });
    }
  });

  // ----- Problem Routes -----
  app.post("/api/problems", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== 'admin') return res.status(403).send("Only admins can create problems");
    
    try {
      const validatedData = insertProblemSchema.parse(req.body);
      const problem = await storage.createProblem(validatedData);
      res.status(201).json(problem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create problem" });
      }
    }
  });

  app.get("/api/contests/:contestId/problems", async (req, res) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const problems = await storage.getProblems(contestId);
      res.json(problems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch problems" });
    }
  });

  app.get("/api/problems/:id", async (req, res) => {
    try {
      const problemId = parseInt(req.params.id);
      const problem = await storage.getProblem(problemId);
      
      if (!problem) {
        return res.status(404).json({ error: "Problem not found" });
      }
      
      res.json(problem);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch problem" });
    }
  });

  // ----- Submission Routes -----
  app.post("/api/submissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertSubmissionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const submission = await storage.createSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create submission" });
      }
    }
  });

  app.get("/api/user/submissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const submissions = await storage.getSubmissions(req.user.id);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  app.get("/api/problems/:problemId/submissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== 'admin') return res.status(403).send("Only admins can view all problem submissions");
    
    try {
      const problemId = parseInt(req.params.problemId);
      const submissions = await storage.getSubmissionsByProblem(problemId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch problem submissions" });
    }
  });

  // ----- Contest Participation Routes -----
  app.post("/api/contests/:contestId/register", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const contestId = parseInt(req.params.contestId);
      
      // Check if contest exists
      const contest = await storage.getContest(contestId);
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }
      
      // Check if user is already registered
      const userContests = await storage.getUserContests(req.user.id);
      const alreadyRegistered = userContests.some(p => p.contestId === contestId);
      
      if (alreadyRegistered) {
        return res.status(400).json({ error: "Already registered for this contest" });
      }
      
      const validatedData = insertContestParticipantSchema.parse({
        userId: req.user.id,
        contestId
      });
      
      const participation = await storage.registerForContest(validatedData);
      res.status(201).json(participation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to register for contest" });
      }
    }
  });

  app.get("/api/user/contests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const participations = await storage.getUserContests(req.user.id);
      res.json(participations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user contests" });
    }
  });

  app.get("/api/contests/:contestId/participants", async (req, res) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const participants = await storage.getContestParticipants(contestId);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contest participants" });
    }
  });

  app.get("/api/contests/:contestId/leaderboard", async (req, res) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const leaderboard = await storage.getContestLeaderboard(contestId);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contest leaderboard" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
