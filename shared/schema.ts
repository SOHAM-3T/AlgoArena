import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("student"),
  rating: integer("rating").notNull().default(1000),
  problemsSolved: integer("problems_solved").notNull().default(0),
  contestsParticipated: integer("contests_participated").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

// Contest schema
export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  difficulty: text("difficulty").notNull().default("Intermediate"),
  createdBy: integer("created_by").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming, active, ended
});

export const insertContestSchema = createInsertSchema(contests).pick({
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  difficulty: true,
  createdBy: true,
});

// Problem schema
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull().default("Intermediate"),
  timeLimit: integer("time_limit").notNull().default(2),
  memoryLimit: integer("memory_limit").notNull().default(256),
  testCases: json("test_cases").notNull(), // Array of input/output test cases
  orderIndex: integer("order_index").notNull(), // A, B, C, D, E...
});

export const insertProblemSchema = createInsertSchema(problems).pick({
  contestId: true,
  title: true,
  description: true,
  difficulty: true,
  timeLimit: true,
  memoryLimit: true,
  testCases: true,
  orderIndex: true,
});

// Submission schema
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  problemId: integer("problem_id").notNull(),
  contestId: integer("contest_id").notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  status: text("status").notNull(), // "Accepted", "Wrong Answer", "Time Limit Exceeded", etc.
  submitTime: timestamp("submit_time").notNull().defaultNow(),
  executionTime: integer("execution_time"), // in milliseconds
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  userId: true,
  problemId: true,
  contestId: true,
  code: true,
  language: true,
  status: true,
});

// Contest Registration schema
export const contestRegistrations = pgTable("contest_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contestId: integer("contest_id").notNull(),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
});

export const insertContestRegistrationSchema = createInsertSchema(contestRegistrations).pick({
  userId: true,
  contestId: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContest = z.infer<typeof insertContestSchema>;
export type Contest = typeof contests.$inferSelect;

export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problems.$inferSelect;

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

export type InsertContestRegistration = z.infer<typeof insertContestRegistrationSchema>;
export type ContestRegistration = typeof contestRegistrations.$inferSelect;
