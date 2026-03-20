"use client";

import { useMemo, useState } from "react";
import { generateEventPool } from "../../data/events/getEvents";
import { supabase } from "../../lib/supabase";

type GameMode = "classica" | "bingo" | "";
type ScoreMode = "democratica" | "anarchia" | "arbitro" | "";
type EventPack =
  | "festivita"
  | "compleanno"
  | "serata_amici"
  | "vacanza"
  | "famiglia"
  | "lavoro"
  | "cerimonia"
  | "";

type EventGroup = "famiglia" | "amici" | "misto" | "coppia" | "";
type VacationLocation = "mare" | "montagna" | "citta" | "estero" | "";
type WorkMode = "settimana" | "mese" | "";

function getRosterMax(participantsCount: number) {
  let baseRosterMax = 2;

  if (participantsCount >= 6 && participantsCount <= 10) {
    baseRosterMax = 3;
  } else if (participantsCount >= 11) {
    baseRosterMax = 5;
  }

  return Math.max(1, Math.min(baseRosterMax, participantsCount - 1));
}

export default function CreatePage() {
  const [step, setStep] = useState(1);

  const [gameMode, setGameMode] = useState<GameMode>("");
  const [scoreMode, setScoreMode] = useState<ScoreMode>("");
  const [eventPack, setEventPack] = useState<EventPack>("");
  const [eventGroup, setEventGroup] = useState<EventGroup>("");
const [vacationDays, setVacationDays] = useState("");
const [vacationLocation, setVacationLocation] = useState<VacationLocation>("");
const [workMode, setWorkMode] = useState<WorkMode>("");

  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);

  const [players, setPlayers] = useState<string[]>([]);
  const [referee, setReferee] = useState("");
  const [me, setMe] = useState("");

  const [phase, setPhase] = useState<"setup" | "voting" | "roster">("setup");
const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
const [votes, setVotes] = useState<
  Record<
    string,
    {
      iconico?: string;
      protagonista?: string;
      tranquillo?: string;
    }
  >
>({});

  const [rosters, setRosters] = useState<Record<string, string[]>>({});
  const rosterMax = getRosterMax(participants.length);

  const currentRoster = useMemo(() => {
    if (!me) return [];
    return rosters[me] ?? [];
  }, [me, rosters]);

  function addParticipant() {
    const name = participantInput.trim();
    if (!name) return;
    if (participants.includes(name)) return;

    setParticipants([...participants, name]);
    setParticipantInput("");
  }

  function removeParticipant(name: string) {
    setParticipants(participants.filter((p) => p !== name));
    setPlayers(players.filter((p) => p !== name));
    if (referee === name) setReferee("");
    if (me === name) setMe("");
  }

  function togglePlayer(name: string) {
    if (players.includes(name)) {
      setPlayers(players.filter((p) => p !== name));
      if (referee === name) setReferee("");
      if (me === name) setMe("");
      return;
    }

    setPlayers([...players, name]);
  }

  function toggleRosterPlayer(name: string) {
  if (!me) return;

  const current = rosters[me] ?? [];
  const checked = current.includes(name);

  if (checked) {
    setRosters({
      ...rosters,
      [me]: current.filter((x) => x !== name),
    });
    return;
  }

  const newCost =
    current.reduce((sum, x) => sum + (playerCosts[x] ?? 0), 0) +
    (playerCosts[name] ?? 0);

 if (current.length >= rosterMax || newCost > budgetMax) {
  alert("Hai superato il budget disponibile");
  return;
}

  setRosters({
    ...rosters,
    [me]: [...current, name],
  });
}
function needsGroupStep(pack: EventPack) {
  return ["festivita", "vacanza", "cerimonia", "compleanno"].includes(pack);
}

function nextStepAfterEventPack() {
  if (needsGroupStep(eventPack)) {
    setStep(4);
    return;
  }

  if (eventPack === "vacanza" || eventPack === "lavoro") {
    setStep(5);
    return;
  }

  setStep(6);
}

function nextStepAfterGroup() {
  if (eventPack === "vacanza" || eventPack === "lavoro") {
    setStep(5);
    return;
  }

  setStep(6);
}

const currentVoter = players[currentVoterIndex] ?? "";

function saveVote(
  question: "iconico" | "protagonista" | "tranquillo",
  target: string
) {
  if (!currentVoter) return;

  setVotes((prev) => ({
    ...prev,
    [currentVoter]: {
      ...prev[currentVoter],
      [question]: target,
    },
  }));
}

function getVoteFor(question: "iconico" | "protagonista" | "tranquillo") {
  return votes[currentVoter]?.[question] ?? "";
}

function isCurrentVoterComplete() {
  if (!currentVoter) return false;

  const current = votes[currentVoter];
  return !!(current?.iconico && current?.protagonista && current?.tranquillo);
}

function goToNextVoter() {
  if (!isCurrentVoterComplete()) return;

  if (currentVoterIndex < players.length - 1) {
    setCurrentVoterIndex(currentVoterIndex + 1);
    return;
  }

  setPhase("roster");
}

const playerCosts: Record<string, number> = {};

const factor = players.length > 0 ? 10 / players.length : 1;

participants.forEach((p) => {
  let iconicoVotes = 0;
  let protagonistaVotes = 0;
  let tranquilloVotes = 0;

  Object.values(votes).forEach((vote) => {
    if (vote.iconico === p) iconicoVotes += 1;
    if (vote.protagonista === p) protagonistaVotes += 1;
    if (vote.tranquillo === p) tranquilloVotes += 1;
  });

  const rawCost =
    15 +
    iconicoVotes * 2 * factor +
    protagonistaVotes * 2 * factor -
    tranquilloVotes * 1 * factor;

  playerCosts[p] = Math.max(10, Math.min(35, Math.round(rawCost)));
});

const budgetMax = rosterMax === 2 ? 40 : rosterMax === 3 ? 60 : 100;

const myRosterCost = (rosters[me] ?? []).reduce(
  (sum: number, player: string) => sum + (playerCosts[player] ?? 0),
  0
);
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
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* STEP 1 */}
       {step === 1 && (
  <div className="card" style={{ textAlign: "center", padding: 24, borderRadius: 24 }}>
    <div className="h2">Come vuoi giocare?</div>

    <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
     <button
  className="card"
  style={{
    textAlign: "left",
    cursor: "pointer",
    width: "100%",
    padding: 20,
    borderRadius: 20,
    minHeight: 110,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    border:
      gameMode === "classica"
        ? "2px solid rgba(255,59,212,.85)"
        : "1px solid rgba(255,255,255,.12)",
    background:
      gameMode === "classica"
        ? "linear-gradient(135deg, rgba(255,59,212,.18), rgba(106,60,255,.18))"
        : "rgba(255,255,255,.04)",
    boxShadow:
      gameMode === "classica"
        ? "0 0 0 1px rgba(255,59,212,.2), 0 12px 30px rgba(255,59,212,.12)"
        : "none",
  }}
  onClick={() => setGameMode("classica")}
>
  <div style={{ fontWeight: 800, fontSize: 20 }}>StoryClassica</div>
  <div className="muted" style={{ marginTop: 8, fontSize: 15 }}>
    Scegli i protagonisti
  </div>
</button>

<button
  className="card"
  style={{
    textAlign: "left",
    cursor: "pointer",
    width: "100%",
    padding: 20,
    borderRadius: 20,
    minHeight: 110,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    border:
      gameMode === "bingo"
        ? "2px solid rgba(255,59,212,.85)"
        : "1px solid rgba(255,255,255,.12)",
    background:
      gameMode === "bingo"
        ? "linear-gradient(135deg, rgba(255,59,212,.18), rgba(106,60,255,.18))"
        : "rgba(255,255,255,.04)",
    boxShadow:
      gameMode === "bingo"
        ? "0 0 0 1px rgba(255,59,212,.2), 0 12px 30px rgba(255,59,212,.12)"
        : "none",
  }}
  onClick={() => setGameMode("bingo")}
>
  <div style={{ fontWeight: 800, fontSize: 20 }}>StoryBingo</div>
  <div className="muted" style={{ marginTop: 8, fontSize: 15 }}>
    Segna i momenti
  </div>
</button>
    </div>

    <div style={{ marginTop: 20 }}>
      <button
        className="btn btnPrimary"
        onClick={() => setStep(2)}
        disabled={!gameMode}
        style={{ opacity: !gameMode ? 0.5 : 1 }}
      >
        Avanti
      </button>
    </div>
  </div>
)}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="card" style={{ textAlign: "center" }}>
            <div className="h2">Chi assegna i punti?</div>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              <button
                className="card"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  borderColor:
                    scoreMode === "democratica"
                      ? "rgba(255,59,212,.7)"
                      : "rgba(255,255,255,.12)",
                }}
                onClick={() => setScoreMode("democratica")}
              >
                <div style={{ fontWeight: 800, fontSize: 18 }}>
                  Democratica
                </div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Tutti votano
                </div>
              </button>

              <button
                className="card"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  borderColor:
                    scoreMode === "anarchia"
                      ? "rgba(255,59,212,.7)"
                      : "rgba(255,255,255,.12)",
                }}
                onClick={() => setScoreMode("anarchia")}
              >
                <div style={{ fontWeight: 800, fontSize: 18 }}>Anarchia</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Ognuno assegna i propri punti
                </div>
              </button>

              <button
                className="card"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  borderColor:
                    scoreMode === "arbitro"
                      ? "rgba(255,59,212,.7)"
                      : "rgba(255,255,255,.12)",
                }}
                onClick={() => setScoreMode("arbitro")}
              >
                <div style={{ fontWeight: 800, fontSize: 18 }}>Arbitro</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Una persona decide i punti
                </div>
              </button>
            </div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <button className="btn" onClick={() => setStep(1)}>
                Indietro
              </button>

              <button
                className="btn btnPrimary"
                onClick={() => setStep(3)}
                disabled={!scoreMode}
                style={{ opacity: !scoreMode ? 0.5 : 1 }}
              >
                Avanti
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="card" style={{ textAlign: "center" }}>
            <div className="h2">Che tipo di evento è?</div>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {[
                ["festivita", "🎄 Festività"],
                ["compleanno", "🎂 Compleanno"],
                ["serata_amici", "🎉 Serata con amici"],
                ["vacanza", "🏖 Vacanza"],
                ["famiglia", "👨‍👩‍👧 Famiglia"],
                ["lavoro", "💼 Lavoro"],
                ["cerimonia", "💍 Cerimonia"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className="card"
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    borderColor:
                      eventPack === value
                        ? "rgba(255,59,212,.7)"
                        : "rgba(255,255,255,.12)",
                  }}
                  onClick={() => setEventPack(value as EventPack)}
                >
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{label}</div>
                </button>
              ))}
            </div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <button className="btn" onClick={() => setStep(2)}>
                Indietro
              </button>

              <button
  className="btn btnPrimary"
  onClick={nextStepAfterEventPack}
  disabled={!eventPack}
  style={{ opacity: !eventPack ? 0.5 : 1 }}
>
  Avanti
</button>
            </div>
          </div>
        )}
        {/* STEP 4 */}
{step === 4 && (
  <div className="card" style={{ textAlign: "center" }}>
    <div className="h2">Con chi?</div>

    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
      {eventPack === "vacanza" && (
        <>
          {[
            ["famiglia", "👨‍👩‍👧 Famiglia"],
            ["amici", "🎉 Amici"],
            ["coppia", "❤️ Coppia"],
          ].map(([value, label]) => (
            <button
              key={value}
              className="card"
              style={{
                textAlign: "left",
                cursor: "pointer",
                borderColor:
                  eventGroup === value
                    ? "rgba(255,59,212,.7)"
                    : "rgba(255,255,255,.12)",
              }}
              onClick={() => setEventGroup(value as EventGroup)}
            >
              <div style={{ fontWeight: 800, fontSize: 18 }}>{label}</div>
            </button>
          ))}
        </>
      )}

      {(eventPack === "festivita" ||
        eventPack === "cerimonia" ||
        eventPack === "compleanno") && (
        <>
          {[
            ["famiglia", "👨‍👩‍👧 Famiglia"],
            ["amici", "🎉 Amici"],
            ["misto", "👥 Misto"],
          ].map(([value, label]) => (
            <button
              key={value}
              className="card"
              style={{
                textAlign: "left",
                cursor: "pointer",
                borderColor:
                  eventGroup === value
                    ? "rgba(255,59,212,.7)"
                    : "rgba(255,255,255,.12)",
              }}
              onClick={() => setEventGroup(value as EventGroup)}
            >
              <div style={{ fontWeight: 800, fontSize: 18 }}>{label}</div>
            </button>
          ))}
        </>
      )}
    </div>

    <div
      style={{
        marginTop: 20,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <button className="btn" onClick={() => setStep(3)}>
        Indietro
      </button>

      <button
        className="btn btnPrimary"
        onClick={nextStepAfterGroup}
        disabled={!eventGroup}
        style={{ opacity: !eventGroup ? 0.5 : 1 }}
      >
        Avanti
      </button>
    </div>
  </div>
)}

{/* STEP 5 */}
{step === 5 && (
  <div className="card">
    {eventPack === "vacanza" && (
      <>
        <div className="h2" style={{ textAlign: "center" }}>
          Dettagli vacanza
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Quanti giorni dura?
          </div>

          <input
            value={vacationDays}
            onChange={(e) => setVacationDays(e.target.value)}
            placeholder="Es. 7"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(255,255,255,.06)",
              color: "white",
              fontSize: 16,
            }}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Dove si svolge?
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {[
              ["mare", "🏖 Mare"],
              ["montagna", "⛰ Montagna"],
              ["citta", "🏙 Città"],
              ["estero", "✈️ Estero"],
            ].map(([value, label]) => (
              <button
                key={value}
                className="card"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  borderColor:
                    vacationLocation === value
                      ? "rgba(255,59,212,.7)"
                      : "rgba(255,255,255,.12)",
                }}
                onClick={() => setVacationLocation(value as VacationLocation)}
              >
                <div style={{ fontWeight: 800, fontSize: 18 }}>{label}</div>
              </button>
            ))}
          </div>
        </div>
      </>
    )}

    {eventPack === "lavoro" && (
      <>
        <div className="h2" style={{ textAlign: "center" }}>
          Dettagli lavoro
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {[
            ["settimana", "📅 Settimana"],
            ["mese", "🗓 Mese"],
          ].map(([value, label]) => (
            <button
              key={value}
              className="card"
              style={{
                textAlign: "left",
                cursor: "pointer",
                borderColor:
                  workMode === value
                    ? "rgba(255,59,212,.7)"
                    : "rgba(255,255,255,.12)",
              }}
              onClick={() => setWorkMode(value as WorkMode)}
            >
              <div style={{ fontWeight: 800, fontSize: 18 }}>{label}</div>
            </button>
          ))}
        </div>
      </>
    )}

    <div
      style={{
        marginTop: 20,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <button
        className="btn"
        onClick={() => {
          if (needsGroupStep(eventPack)) {
            setStep(4);
          } else {
            setStep(3);
          }
        }}
      >
        Indietro
      </button>

      <button
        className="btn btnPrimary"
        onClick={() => setStep(6)}
        disabled={
          (eventPack === "vacanza" && (!vacationDays || !vacationLocation)) ||
          (eventPack === "lavoro" && !workMode)
        }
        style={{
          opacity:
            (eventPack === "vacanza" && (!vacationDays || !vacationLocation)) ||
            (eventPack === "lavoro" && !workMode)
              ? 0.5
              : 1,
        }}
      >
        Avanti
      </button>
    </div>
  </div>
)}

        {/* STEP 6 */}
        {step === 6 && (
          <div className="card">
            <div className="h2" style={{ textAlign: "center" }}>
              Aggiungi i partecipanti
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <input
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                placeholder="Nome partecipante"
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.06)",
                  color: "white",
                  fontSize: 16,
                }}
              />

              <button className="btn btnPrimary" onClick={addParticipant}>
                Aggiungi
              </button>
            </div>

            <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  }}
>
  {participants.map((p) => (
    <div
      key={p}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 999,
        background: "rgba(255,255,255,.08)",
        border: "1px solid rgba(255,255,255,.10)",
      }}
    >
      <span style={{ fontWeight: 600 }}>{p}</span>
      <button
        onClick={() => removeParticipant(p)}
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 800,
          background: "rgba(255,255,255,.14)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  ))}
</div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <button className="btn" onClick={() => setStep(5)}>
                Indietro
              </button>

              <button
                className="btn btnPrimary"
                onClick={() => setStep(7)}
                disabled={participants.length < 2}
                style={{ opacity: participants.length < 2 ? 0.5 : 1 }}
              >
                Avanti
              </button>
            </div>
          </div>
        )}

        {/* STEP 7 */}
        {step === 7 && (
          <div className="card">
            <div className="h2" style={{ textAlign: "center" }}>
              Giocatori
            </div>

            <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
              {participants.map((p) => {
                const checked = players.includes(p);

                return (
                  <button
                    key={p}
                    className="card"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      opacity: checked ? 1 : 0.8,
                      borderColor: checked
                        ? "rgba(255,59,212,.7)"
                        : "rgba(255,255,255,.12)",
                    }}
                    onClick={() => togglePlayer(p)}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {scoreMode === "arbitro" && (
              <div style={{ marginTop: 24 }}>
                <div className="h2" style={{ textAlign: "center" }}>
                  Arbitro
                </div>

                <select
                  value={referee}
                  onChange={(e) => setReferee(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,.12)",
                    background: "rgba(255,255,255,.06)",
                    color: "white",
                  }}
                >
                  <option value="">Seleziona arbitro</option>
                  {participants.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <div className="h2" style={{ textAlign: "center" }}>
                Io sono
              </div>

              <select
                value={me}
                onChange={(e) => setMe(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.06)",
                  color: "white",
                }}
              >
                <option value="">Seleziona il tuo nome</option>
                {players.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <button className="btn" onClick={() => setStep(6)}>
                Indietro
              </button>

              <button
                className="btn btnPrimary"
               onClick={async () => {
  const generated = generateEventPool({
    eventPack,
    eventGroup,
    location: vacationLocation,
  });

  const code = Math.random().toString(36).slice(2, 8).toUpperCase();

  const eventData = {
    code,
    gameMode,
    scoreMode,
    eventPack,
    eventGroup,
    vacationDays,
    vacationLocation,
    workMode,
    participants,
    players,
    referee,
    me,
    rosters,
    generatedEvents: generated,
  };

localStorage.setItem(
    `fantastories-event-${code}`,
    JSON.stringify(eventData)
  );

  const { error } = await supabase.from("events").insert([
    {
      code,
      data: eventData,
    },
  ]);

  if (error) {
    alert("Errore salvataggio evento online");
    console.error(error);
    return;
  }

  localStorage.setItem("fantastories_me", me);
  window.location.href = `/e/${code}`;
}}

                disabled={players.length < 2 || !me || (scoreMode === "arbitro" && !referee)}
                style={{
                  opacity:
                    players.length < 2 || !me || (scoreMode === "arbitro" && !referee)
                      ? 0.5
                      : 1,
                }}
              >
                Avanti
              </button>
            </div>
          </div>
        )}

        {/* STEP 8 */}
{step === 8 && (
 <>
 {phase === "voting" && (
  <div className="card">
  <div className="h2" style={{ textAlign: "center" }}>
    Votazione pre-partita
  </div>

  <div className="muted" style={{ marginTop: 8, textAlign: "center" }}>
    Sta votando: <b>{currentVoter}</b>
  </div>

  <div style={{ marginTop: 20, display: "grid", gap: 18 }}>
    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        Chi sarà il più iconico?
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {participants.map((p) => (
          <button
            key={`iconico-${p}`}
            className="badge"
            style={{
              opacity: getVoteFor("iconico") === p ? 1 : 0.75,
              borderColor:
                getVoteFor("iconico") === p
                  ? "rgba(255,59,212,.7)"
                  : "rgba(255,255,255,.12)",
              background:
                getVoteFor("iconico") === p
                  ? "rgba(255,59,212,.15)"
                  : "rgba(255,255,255,.05)",
              fontWeight: getVoteFor("iconico") === p ? 800 : 600,
              padding: 12,
              borderRadius: 14,
            }}
            onClick={() => saveVote("iconico", p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>

    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        Chi sarà il protagonista della giornata?
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {participants.map((p) => (
          <button
            key={`protagonista-${p}`}
            className="badge"
            style={{
              opacity: getVoteFor("protagonista") === p ? 1 : 0.75,
              borderColor:
                getVoteFor("protagonista") === p
                  ? "rgba(255,59,212,.7)"
                  : "rgba(255,255,255,.12)",
              background:
                getVoteFor("protagonista") === p
                  ? "rgba(255,59,212,.15)"
                  : "rgba(255,255,255,.05)",
              fontWeight: getVoteFor("protagonista") === p ? 800 : 600,
              padding: 12,
              borderRadius: 14,
            }}
            onClick={() => saveVote("protagonista", p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>

    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        Chi sarà il più tranquillo?
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {participants.map((p) => (
          <button
            key={`tranquillo-${p}`}
            className="badge"
            style={{
              opacity: getVoteFor("tranquillo") === p ? 1 : 0.75,
              borderColor:
                getVoteFor("tranquillo") === p
                  ? "rgba(255,59,212,.7)"
                  : "rgba(255,255,255,.12)",
              background:
                getVoteFor("tranquillo") === p
                  ? "rgba(255,59,212,.15)"
                  : "rgba(255,255,255,.05)",
              fontWeight: getVoteFor("tranquillo") === p ? 800 : 600,
              padding: 12,
              borderRadius: 14,
            }}
            onClick={() => saveVote("tranquillo", p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  </div>

  <div
    style={{
      marginTop: 20,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
    }}
  >
    <button className="btn" onClick={() => setStep(7)}>
      Indietro
    </button>

    <button
      className="btn btnPrimary"
      onClick={goToNextVoter}
      disabled={!isCurrentVoterComplete()}
      style={{ opacity: !isCurrentVoterComplete() ? 0.5 : 1 }}
    >
      {currentVoterIndex === players.length - 1 ? "Calcola costi" : "Vota e continua"}
    </button>
  </div>
</div>
  )}

        {phase === "roster" && (
          
          <div className="card">
            <div className="h2" style={{ textAlign: "center" }}>
              Crea la tua squadra
            </div>

            <div className="muted" style={{ marginTop: 8, textAlign: "center" }}>
              Selezionati: <b>{currentRoster.length}</b> / <b>{rosterMax}</b>
            </div>
            <div className="muted" style={{ marginTop: 8, textAlign: "center" }}>
  Budget: <b>{myRosterCost}</b> / <b>{budgetMax}</b> Storix
</div>

            <div
              className="card"
              style={{
                marginTop: 16,
                textAlign: "center",
                borderStyle: "dashed",
                opacity: 0.8,
              }}
            >
              <div style={{ fontWeight: 800 }}>Modalità Asta</div>
              <div className="muted" style={{ marginTop: 6 }}>
                coming soon
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
                marginTop: 16,
              }}
            >
              {participants
                .filter((p) => p !== me)
                .map((p) => {
                  const checked = currentRoster.includes(p);

                  return (
                    <button
                      key={p}
                      className="badge"
                      style={{
                        cursor: "pointer",
                        opacity: checked ? 1 : 0.75,
                        borderColor: checked
                          ? "rgba(255,59,212,.7)"
                          : "rgba(255,255,255,.12)",
                        background: checked
                          ? "rgba(255,59,212,.15)"
                          : "rgba(255,255,255,.05)",
                        fontWeight: checked ? 800 : 600,
                      }}
                      onClick={() => toggleRosterPlayer(p)}
                   >
  {p} • {playerCosts[p]} Storix
</button>
                  );
                })}
            </div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <button className="btn" onClick={() => setStep(7)}>
                Indietro
              </button>

              <button
  className="btn btnPrimary"
  onClick={async () => {
  const generated = generateEventPool({
    eventPack,
    eventGroup,
    location: vacationLocation,
  });

  const code = Math.random().toString(36).slice(2, 8).toUpperCase();

  const eventData = {
    code,
    gameMode,
    scoreMode,
    eventPack,
    eventGroup,
    vacationDays,
    vacationLocation,
    workMode,
    participants,
    players,
    referee,
    me,
    rosters,
    generatedEvents: generated,
  };

  localStorage.setItem(
    `fantastories-event-${code}`,
    JSON.stringify(eventData)
  );

  const { error } = await supabase.from("events").insert([
    {
      code,
      data: eventData,
    },
  ]);

  if (error) {
    alert("Errore salvataggio evento online");
    console.error(error);
    return;
  }

localStorage.setItem("fantastories_me", me);

  window.location.href = `/e/${code}`;
}}
>
  🚀 Inizia Evento
</button>
            </div>
          </div>
        )}
        </>
        )}
          {/* STEP 9 */}
        {step === 9 && (
          <div className="card">
            <div className="h2" style={{ textAlign: "center" }}>
              Evento creato
            </div>

            <div className="muted" style={{ marginTop: 8, textAlign: "center" }}>
              Anteprima della partita
            </div>

            {(() => {
              const saved =
                typeof window !== "undefined"
                  ? localStorage.getItem("fantastories-current-event")
                  : null;

              const parsed = saved ? JSON.parse(saved) : null;

              if (!parsed) {
                return <div style={{ marginTop: 20 }}>Nessun evento salvato.</div>;
              }

              return (
                <div style={{ marginTop: 20 }}>
                  <div style={{ marginBottom: 12 }}>
                    <b>Evento:</b> {parsed.eventPack || "-"}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <b>Partecipanti:</b> {parsed.participants?.length || 0}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <b>Giocatori:</b> {parsed.players?.length || 0}
                  </div>

                  <div className="h2" style={{ fontSize: 20, marginBottom: 12 }}>
                    Eventi generati
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                   {(() => {
  const allEvents = parsed.generatedEvents?.allEvents || [];

  const bonus = allEvents.filter(
    (event: any) => event.points > 0 && !event.tags?.includes("epico")
  );

  const epicBonus = allEvents.filter(
    (event: any) => event.points > 0 && event.tags?.includes("epico")
  );

  const malus = allEvents.filter(
    (event: any) => event.points < 0 && !event.tags?.includes("epico")
  );

  const epicMalus = allEvents.filter(
    (event: any) => event.points < 0 && event.tags?.includes("epico")
  );

  const renderEvent = (event: any) => (
    <div
      key={event.id}
      className="card"
      style={{
        padding: 12,
        borderColor: event.tags?.includes("epico")
          ? "rgba(255,59,212,.7)"
          : "rgba(255,255,255,.12)",
      }}
    >
      <div style={{ fontWeight: 700 }}>{event.text}</div>
     <div className="muted" style={{ marginTop: 4 }}>
  <span
    style={{
      color: event.points > 0 ? "#4ade80" : "#f87171",
      fontWeight: 800,
    }}
  >
    {event.points > 0 ? "+" : ""}
    {event.points} pt
  </span>
  {event.type === "all" && " • per tutti"}
</div>
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <div className="h2" style={{ fontSize: 18, marginBottom: 10 }}>
          Bonus
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {bonus.map(renderEvent)}
        </div>
      </div>

      <div>
        <div className="h2" style={{ fontSize: 18, marginBottom: 10 }}>
          Bonus epici
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {epicBonus.map(renderEvent)}
        </div>
      </div>

      <div>
        <div className="h2" style={{ fontSize: 18, marginBottom: 10 }}>
          Malus
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {malus.map(renderEvent)}
        </div>
      </div>

      <div>
        <div className="h2" style={{ fontSize: 18, marginBottom: 10 }}>
          Malus epici
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {epicMalus.map(renderEvent)}
        </div>
      </div>
    </div>
  );
})()}
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <button className="btn" onClick={() => setStep(8)}>
                      Indietro
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </main>
  );
}
   