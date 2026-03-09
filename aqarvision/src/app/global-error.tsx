"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              Une erreur est survenue
            </h1>
            <p style={{ color: "#666", marginBottom: 24 }}>
              Veuillez réessayer ou revenir à la page d&apos;accueil.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "10px 24px",
                backgroundColor: "#0c1b2a",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
