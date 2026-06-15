import { describe, it, expect } from "vitest";
import {
  registerSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

describe("registerSchema", () => {
  const valid = {
    email: "user@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts a valid payload", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("trims and lowercases the email", () => {
    const result = registerSchema.parse({ ...valid, email: "  USER@Example.COM  " });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects an invalid email", () => {
    expect(registerSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "different1" });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts email and a non-empty password", () => {
    expect(
      signInSchema.safeParse({ email: "user@example.com", password: "x" }).success,
    ).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(
      signInSchema.safeParse({ email: "user@example.com", password: "" }).success,
    ).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const valid = {
    token: "tok",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts a valid payload", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a missing token", () => {
    expect(resetPasswordSchema.safeParse({ ...valid, token: "" }).success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    expect(
      resetPasswordSchema.safeParse({ ...valid, confirmPassword: "different1" }).success,
    ).toBe(false);
  });
});
