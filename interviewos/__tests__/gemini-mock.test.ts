import { describe, it, expect } from "vitest";
import {
  getMockOpener,
  getMockNextQuestion,
  getMockFeedback,
} from "../lib/gemini-mock";

const ALL_ROLES = [
  "frontend-jr",
  "backend-jr",
  "fullstack-jr",
  "data-jr",
  "mobile-jr",
];

describe("getMockOpener", () => {
  it("returns a non-empty string for every valid role", () => {
    for (const role of ALL_ROLES) {
      const opener = getMockOpener(role);
      expect(typeof opener).toBe("string");
      expect(opener.length).toBeGreaterThan(10);
    }
  });

  it("returns a fallback for unknown roles", () => {
    const opener = getMockOpener("unknown-role");
    expect(typeof opener).toBe("string");
    expect(opener.length).toBeGreaterThan(10);
  });
});

describe("getMockNextQuestion", () => {
  it("returns a question for index 0", () => {
    const result = getMockNextQuestion("frontend-jr", 0, "some answer");
    expect(result.isEnding).toBe(false);
    expect(result.message.length).toBeGreaterThan(10);
  });

  it("returns ending when index exceeds question pool", () => {
    const result = getMockNextQuestion("frontend-jr", 999, "some answer");
    expect(result.isEnding).toBe(true);
    expect(result.message.length).toBeGreaterThan(10);
  });

  it("handles negative questionIndex without crashing (safeIndex clamp)", () => {
    const result = getMockNextQuestion("frontend-jr", -1, "answer");
    expect(result).toBeDefined();
    expect(typeof result.message).toBe("string");
  });

  it("works for all valid roles", () => {
    for (const role of ALL_ROLES) {
      const result = getMockNextQuestion(role, 0, "test");
      expect(result.isEnding).toBe(false);
      expect(result.message.length).toBeGreaterThan(0);
    }
  });
});

describe("getMockFeedback", () => {
  it("returns a valid feedback object structure", () => {
    const fb = getMockFeedback("frontend-jr") as Record<string, unknown>;
    expect(typeof fb.score).toBe("number");
    expect((fb.score as number)).toBeGreaterThanOrEqual(0);
    expect((fb.score as number)).toBeLessThanOrEqual(100);
    expect(typeof fb.summary).toBe("string");
    expect(Array.isArray(fb.strengths)).toBe(true);
    expect(Array.isArray(fb.improvements)).toBe(true);
    expect(Array.isArray(fb.studyPlan)).toBe(true);
    expect(typeof fb.verdict).toBe("string");
    expect(["aprovado", "em_desenvolvimento", "precisa_evoluir"]).toContain(fb.verdict);
    expect(typeof fb.verdictMessage).toBe("string");
  });

  it("uses the provided score when given", () => {
    const fb = getMockFeedback("backend-jr", 90) as Record<string, unknown>;
    expect(fb.score).toBe(90);
    expect(fb.verdict).toBe("aprovado");
  });

  it("sets correct verdict for score 60", () => {
    const fb = getMockFeedback("backend-jr", 60) as Record<string, unknown>;
    expect(fb.verdict).toBe("em_desenvolvimento");
  });

  it("sets correct verdict for score 40", () => {
    const fb = getMockFeedback("backend-jr", 40) as Record<string, unknown>;
    expect(fb.verdict).toBe("precisa_evoluir");
  });

  it("returns improvements with required fields", () => {
    const fb = getMockFeedback("data-jr") as Record<string, unknown>;
    const improvements = fb.improvements as Array<Record<string, unknown>>;
    for (const item of improvements) {
      expect(typeof item.area).toBe("string");
      expect(typeof item.description).toBe("string");
      expect(typeof item.suggestion).toBe("string");
    }
  });

  it("returns studyPlan with required fields", () => {
    const fb = getMockFeedback("mobile-jr") as Record<string, unknown>;
    const plan = fb.studyPlan as Array<Record<string, unknown>>;
    for (const item of plan) {
      expect(typeof item.topic).toBe("string");
      expect(["alta", "média", "baixa"]).toContain(item.priority);
      expect(Array.isArray(item.resources)).toBe(true);
    }
  });
});
