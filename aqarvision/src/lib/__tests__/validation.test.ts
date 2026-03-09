import { describe, it, expect } from "vitest";
import {
  validerTelephoneAlgerien,
  formatTelWhatsApp,
  validerPrix,
  validerSurface,
  validerSlug,
} from "@/lib/validation";

describe("validerTelephoneAlgerien", () => {
  it("should accept valid mobile numbers with +213", () => {
    expect(validerTelephoneAlgerien("+213551234567").valide).toBe(true);
    expect(validerTelephoneAlgerien("+213661234567").valide).toBe(true);
    expect(validerTelephoneAlgerien("+213771234567").valide).toBe(true);
  });

  it("should accept valid local format numbers", () => {
    expect(validerTelephoneAlgerien("0551234567").valide).toBe(true);
    expect(validerTelephoneAlgerien("0661234567").valide).toBe(true);
    expect(validerTelephoneAlgerien("0771234567").valide).toBe(true);
  });

  it("should accept numbers with spaces/dashes", () => {
    expect(validerTelephoneAlgerien("+213 55 12 34 567").valide).toBe(true);
    expect(validerTelephoneAlgerien("055-12-34-567").valide).toBe(true);
  });

  it("should reject invalid numbers", () => {
    expect(validerTelephoneAlgerien("0123456789").valide).toBe(false);
    expect(validerTelephoneAlgerien("+33612345678").valide).toBe(false);
    expect(validerTelephoneAlgerien("").valide).toBe(false);
    expect(validerTelephoneAlgerien("abc").valide).toBe(false);
  });

  it("should format to international format", () => {
    const result = validerTelephoneAlgerien("0551234567");
    expect(result.formate).toContain("+213");
  });
});

describe("formatTelWhatsApp", () => {
  it("should convert local to international without +", () => {
    expect(formatTelWhatsApp("0551234567")).toBe("213551234567");
  });

  it("should strip + from international", () => {
    expect(formatTelWhatsApp("+213551234567")).toBe("213551234567");
  });

  it("should remove spaces and dashes", () => {
    expect(formatTelWhatsApp("+213 55 12 34 567")).toBe("213551234567");
  });
});

describe("validerPrix", () => {
  it("should reject negative or zero prices", () => {
    expect(validerPrix(0, "Vente").valide).toBe(false);
    expect(validerPrix(-1000, "Location").valide).toBe(false);
  });

  it("should enforce minimum sale price", () => {
    expect(validerPrix(50000, "Vente").valide).toBe(false);
    expect(validerPrix(100000, "Vente").valide).toBe(true);
    expect(validerPrix(5000000, "Vente").valide).toBe(true);
  });

  it("should enforce minimum rental price", () => {
    expect(validerPrix(3000, "Location").valide).toBe(false);
    expect(validerPrix(5000, "Location").valide).toBe(true);
    expect(validerPrix(50000, "Location").valide).toBe(true);
  });
});

describe("validerSurface", () => {
  it("should reject invalid surfaces", () => {
    expect(validerSurface(0).valide).toBe(false);
    expect(validerSurface(-10).valide).toBe(false);
    expect(validerSurface(200000).valide).toBe(false);
  });

  it("should accept valid surfaces", () => {
    expect(validerSurface(50).valide).toBe(true);
    expect(validerSurface(500).valide).toBe(true);
    expect(validerSurface(10000).valide).toBe(true);
  });
});

describe("validerSlug", () => {
  it("should accept valid slugs", () => {
    expect(validerSlug("mon-agence").valide).toBe(true);
    expect(validerSlug("agence123").valide).toBe(true);
    expect(validerSlug("abc").valide).toBe(true);
  });

  it("should reject invalid slugs", () => {
    expect(validerSlug("").valide).toBe(false);
    expect(validerSlug("ab").valide).toBe(false);
    expect(validerSlug("Mon Agence").valide).toBe(false);
    expect(validerSlug("a".repeat(51)).valide).toBe(false);
  });
});
