import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Events table for storing chat history
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  user_input: text("user_input").notNull(),
  ai_response: text("ai_response"),
  task_output: text("task_output"),
  attack_plan: jsonb("attack_plan"),
});

// Tools table for storing tool status
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  tool_name: text("tool_name").notNull().unique(),
  installed: boolean("installed").default(false),
  last_used: timestamp("last_used"),
});

// Exploits table for storing generated exploits
export const exploits = pgTable("exploits", {
  id: serial("id").primaryKey(),
  target: text("target").notNull(),
  exploit_code: text("exploit_code").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Target info table for storing information about scanned targets
export const targets = pgTable("targets", {
  id: serial("id").primaryKey(),
  ip_address: text("ip_address").notNull().unique(),
  hostname: text("hostname"),
  os: text("os"),
  ports: jsonb("ports"),
  services: jsonb("services"),
  vulnerabilities: jsonb("vulnerabilities"),
  last_scanned: timestamp("last_scanned").defaultNow().notNull(),
});

// Insert schemas
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertToolSchema = createInsertSchema(tools).omit({ id: true });
export const insertExploitSchema = createInsertSchema(exploits).omit({ id: true });
export const insertTargetSchema = createInsertSchema(targets).omit({ id: true });

// Types
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type InsertExploit = z.infer<typeof insertExploitSchema>;
export type InsertTarget = z.infer<typeof insertTargetSchema>;

export type Event = typeof events.$inferSelect;
export type Tool = typeof tools.$inferSelect;
export type Exploit = typeof exploits.$inferSelect;
export type Target = typeof targets.$inferSelect;

// User types (from the existing schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
