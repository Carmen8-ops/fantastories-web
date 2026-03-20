"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

 async function handleJoin() {
  const cleanCode = code.trim().toUpperCase();
  const cleanName = name.trim();

  if (!cleanCode || !cleanName) {
    setError("Inserisci nome e codice evento.");
    return;
  }

  const { data, error: fetchError } = await supabase
    .from("events")
    .select("*")
    .eq("code", cleanCode)
    .single();

  if (fetchError || !data) {
    setError("Evento non trovato.");
    return;
  }

  const eventData = data.data;

  const participants: string[] = eventData.participants ?? [];
  const players: string[] = eventData.players ?? [];

  if (!participants.includes(cleanName)) {
    eventData.participants = [...participants, cleanName];
  }

  if (!players.includes(cleanName)) {
    eventData.players = [...players, cleanName];
  }

  const { error: updateError } = await supabase
    .from("events")
    .update({ data: eventData })
    .eq("code", cleanCode);

  if (updateError) {
    setError("Errore aggiornamento evento.");
    return;
  }

  localStorage.setItem("fantastories_me", cleanName);

  window.location.href = `/e/${cleanCode}`;
}
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Entra con codice</h1>

      <div style={{ marginTop: 16, display: "grid", gap: 12, maxWidth: 320 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Il tuo nome"
          style={{ padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
        />

        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="Codice evento (es. AB12CD)"
          style={{ padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
        />

        <button
          onClick={handleJoin}
          style={{
            padding: 12,
            borderRadius: 10,
            border: 0,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Entra
        </button>

        {error && (
          <div style={{ color: "red", fontSize: 14 }}>
            {error}
          </div>
        )}
      </div>
    </main>
  );
}