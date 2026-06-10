import { z } from "zod";

// Trim + lowercase before validating the email format (transforms must run
// before z.email(), otherwise surrounding whitespace fails validation).
const email = z.string().trim().toLowerCase().pipe(z.email());

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email,
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email,
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
