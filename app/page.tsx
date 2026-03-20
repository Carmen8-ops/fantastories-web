"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <main
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
        }}
      >
        <img
          src="/splash.png"
          alt="Splash"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </main>
    );
  }
  <main
  className="container"
  style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  }}
></main>

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <img
          src="/fantastories-logo.png"
          alt="FantaStories"
          style={{ width: "100%", maxWidth: 260 }}
        />

        <div style={{ marginTop: 24, fontSize: 28, fontWeight: 700 }}>
          Gioca i tuoi momenti
        </div>

        <div style={{ marginTop: 12, opacity: 0.8, lineHeight: 1.5 }}>
          Dal pranzo in famiglia alla pausa caffè: ogni momento vale.
        </div>

        <div style={{ marginTop: 32, display: "grid", gap: 12 }}>
          <a
            href="/create"
            style={{
              padding: 14,
              borderRadius: 14,
              textDecoration: "none",
              color: "white",
              fontWeight: 700,
              background: "linear-gradient(90deg, #ff2f92, #6a3cff)",
            }}
          >
            CREA EVENTO
          </a>

          <a
            href="/join"
            style={{
              padding: 14,
              borderRadius: 14,
              textDecoration: "none",
              color: "white",
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            UNISCITI A EVENTO
          </a>
        </div>
      </div>
    </main>
  );
}