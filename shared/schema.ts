import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export const userRoleEnum = pgEnum('user_role', ['student', 'admin']);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  points: integer("points").notNull().default(0),
  problemsSolved: integer("problems_solved").notNull().default(0),
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
  difficulty: text("difficulty").notNull(), // 'Beginner', 'Intermediate', 'Advanced'
  status: text("status").notNull(), // 'Upcoming', 'Active', 'Completed'
  createdBy: integer("created_by").notNull(), // admin id who created the contest
});

export const insertContestSchema = createInsertSchema(contests).pick({
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  difficulty: true,
  status: true,
  createdBy: true,
});

// Problem schema
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // 'Easy', 'Medium', 'Hard'
  timeLimit: integer("time_limit").notNull(), // in seconds
  memoryLimit: integer("memory_limit").notNull(), // in MB
  inputFormat: text("input_format").notNull(),
  outputFormat: text("output_format").notNull(),
  sampleInput: text("sample_input").notNull(),
  sampleOutput: text("sample_output").notNull(),
  explanation: text("explanation"),
  points: integer("points").notNull(),
});

export const insertProblemSchema = createInsertSchema(problems).pick({
  contestId: true,
  title: true,
  description: true,
  difficulty: true,
  timeLimit: true,
  memoryLimit: true,
  inputFormat: true,
  outputFormat: true,
  sampleInput: true,
  sampleOutput: true,
  explanation: true,
  points: true,
});

// Submission schema
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  problemId: integer("problem_id").notNull(),
  contestId: integer("contest_id").notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(), // 'python', 'java', 'cpp', 'javascript'
  status: text("status").notNull(), // 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', etc.
  score: integer("score").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  userId: true,
  problemId: true,
  contestId: true,
  code: true,
  language: true,
  status: true,
  score: true,
});

// Contest Participation schema
export const contestParticipants = pgTable("contest_participants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contestId: integer("contest_id").notNull(),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  score: integer("score").notNull().default(0),
  rank: integer("rank"),
});

export const insertContestParticipantSchema = createInsertSchema(contestParticipants).pick({
  userId: true,
  contestId: true,
});

// Exported types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Contest = typeof contests.$inferSelect;
export type InsertContest = z.infer<typeof insertContestSchema>;

export type Problem = typeof problems.$inferSelect;
export type InsertProblem = z.infer<typeof insertProblemSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type ContestParticipant = typeof contestParticipants.$inferSelect;
export type InsertContestParticipant = z.infer<typeof insertContestParticipantSchema>;
