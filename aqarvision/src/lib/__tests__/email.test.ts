import { describe, it, expect } from "vitest";

// Test the escapeHtml function indirectly through templates
// We import and test the module

describe("email module", () => {
  describe("escapeHtml", () => {
    // We need to test the escapeHtml function
    // Since it's not exported, we test it through the templates
    it("should escape HTML characters in template output", async () => {
      // Dynamic import to handle module side effects
      const { templates } = await import("@/lib/email");

      const maliciousName = '<script>alert("xss")</script>';
      const result = templates.bienvenue(maliciousName);

      expect(result.html).not.toContain("<script>");
      expect(result.html).toContain("&lt;script&gt;");
      expect(result.subject).not.toContain("<script>");
    });

    it("should escape HTML in nouveau_contact template", async () => {
      const { templates } = await import("@/lib/email");

      const result = templates.nouveau_contact({
        nomAgence: '<img onerror="hack" src=x>',
        titreAnnonce: "Normal Title",
        typeContact: "whatsapp",
        nomProspect: "John",
      });

      expect(result.html).not.toContain('<img onerror');
      expect(result.html).toContain("&lt;img");
    });

    it("should escape notes in verification_document template", async () => {
      const { templates } = await import("@/lib/email");

      const result = templates.verification_document({
        nomAgence: "Agence Test",
        titreAnnonce: "Titre",
        statut: "verified",
        notes: '<script>document.cookie</script>',
      });

      expect(result.html).not.toContain("<script>document.cookie");
      expect(result.html).toContain("&lt;script&gt;");
    });
  });
});
