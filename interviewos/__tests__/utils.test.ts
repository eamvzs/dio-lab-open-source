import { describe, it, expect } from "vitest";
import {
  getScoreColor,
  getScoreBg,
  getVerdictLabel,
  getVerdictColor,
  formatDate,
} from "../lib/utils";

describe("getScoreColor", () => {
  it("returns green for score >= 75", () => {
    expect(getScoreColor(75)).toBe("text-green-500");
    expect(getScoreColor(100)).toBe("text-green-500");
  });

  it("returns yellow for score 50-74", () => {
    expect(getScoreColor(50)).toBe("text-yellow-500");
    expect(getScoreColor(74)).toBe("text-yellow-500");
  });

  it("returns red for score < 50", () => {
    expect(getScoreColor(0)).toBe("text-red-500");
    expect(getScoreColor(49)).toBe("text-red-500");
  });
});

describe("getScoreBg", () => {
  it("returns green bg for score >= 75", () => {
    expect(getScoreBg(80)).toBe("bg-green-500");
  });

  it("returns yellow bg for score 50-74", () => {
    expect(getScoreBg(60)).toBe("bg-yellow-500");
  });

  it("returns red bg for score < 50", () => {
    expect(getScoreBg(30)).toBe("bg-red-500");
  });
});

describe("getVerdictLabel", () => {
  it("returns correct label for each verdict", () => {
    expect(getVerdictLabel("aprovado")).toBe("Aprovado");
    expect(getVerdictLabel("em_desenvolvimento")).toBe("Em Desenvolvimento");
    expect(getVerdictLabel("precisa_evoluir")).toBe("Precisa Evoluir");
  });

  it("returns raw string for unknown verdict", () => {
    expect(getVerdictLabel("unknown")).toBe("unknown");
  });
});

describe("getVerdictColor", () => {
  it("returns correct color for each verdict", () => {
    expect(getVerdictColor("aprovado")).toBe("text-green-500");
    expect(getVerdictColor("em_desenvolvimento")).toBe("text-yellow-500");
    expect(getVerdictColor("precisa_evoluir")).toBe("text-red-500");
  });

  it("returns fallback gray for unknown verdict", () => {
    expect(getVerdictColor("unknown")).toBe("text-gray-500");
  });
});

describe("formatDate", () => {
  it("formats a date string as pt-BR date/time", () => {
    const result = formatDate("2024-06-15T10:30:00");
    // Should contain day, month and year in pt-BR format
    expect(result).toMatch(/15/);
    expect(result).toMatch(/06/);
    expect(result).toMatch(/2024/);
  });

  it("accepts a Date object", () => {
    const date = new Date("2024-01-01T00:00:00");
    const result = formatDate(date);
    expect(result).toMatch(/01/);
    expect(result).toMatch(/2024/);
  });
});
