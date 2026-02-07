import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  displayName: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein").max(50),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const classroomSchema = z.object({
  name: z.string().min(1, "Name darf nicht leer sein").max(100),
  description: z.string().max(500).optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(1).max(200),
  classroomId: z.string().cuid(),
  language: z.enum(["de", "en", "es"]).optional(),
  groupCount: z.number().int().min(1).max(30).optional().default(1),
});

export const blogPostUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.any().optional(),
  commentsEnabled: z.boolean().optional(),
});

export const joinCollabSchema = z.object({
  displayName: z.string().min(1, "Name darf nicht leer sein").max(30),
});

export const commentSchema = z.object({
  authorName: z.string().min(1).max(50),
  content: z.string().min(1).max(2000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ClassroomInput = z.infer<typeof classroomSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>;
export type JoinCollabInput = z.infer<typeof joinCollabSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
