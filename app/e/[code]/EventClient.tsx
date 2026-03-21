"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type EventItem = {
  id: string;
  text: string;
  points: number;
  type: string;
  tags: string[];
};

type EventRequest = {
  id: string;
  eventId: string;
  eventText: string;
  target: string;
  points: number;
  requestedBy: string;
  type: string;
};

type SavedEvent = {
  code: string;
  gameMode: string;
  scoreMode: string;
  eventPack: string;
  eventGroup: string;
  vacationDays: string;
  vacationLocation: string;
  workMode: string;
  participants: string[];
  players: string[];
  referee: string;
  me: string;
  rosters: Record<string, string[]>;
  generatedEvents: {
    genericEvents: EventItem[];
    packEvents: EventItem[];
    epicEvents: EventItem[];
    allEvents: EventItem[];
  };
  scores?: Record<string, number>;
  requests?: EventRequest[];
  participantCosts?: Record<string, number>; 
  currentDay?: number;
dayParticipantScores?: Record<string, number>;
dailyScores?: Record<number, Record<string, number>>;
totalScores?: Record<string, number>;
  votes?: Record<
  string,
  {
    iconico?: string;
    protagonista?: string;
    tranquillo?: string;
  }
>;
};

type ViewMode = "home" | "eventi" | "classifiche" | "squadre" | "profilo" | "bonus";

function getRosterMax(participantsCount: number) {
  let baseRosterMax = 2;

  if (participantsCount >= 6 && participantsCount <= 10) {
    baseRosterMax = 3;
  } else if (participantsCount >= 11) {
    baseRosterMax = 5;
  }

  return Math.max(1, Math.min(baseRosterMax, participantsCount - 1));
}

export default function EventClient({ code }: { code: string }) {
  const [eventData, setEventData] = useState<SavedEvent | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [view, setView] = useState<ViewMode>("eventi");
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [toast, setToast] = useState("");
  const [isChoosingRoster, setIsChoosingRoster] = useState(false);
  const [votingPhase, setVotingPhase] = useState(false);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [isApplyingRemoteUpdate, setIsApplyingRemoteUpdate] = useState(false);
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

/*
  useEffect(() => {
    const raw = localStorage.getItem(`fantastories-event-${code}`);
    if (!raw) return;

    const parsed = JSON.parse(raw) as SavedEvent;
    setEventData(parsed);
    const myRoster = parsed.rosters?.[parsed.me] ?? [];
if (parsed.me && myRoster.length === 0) {
  setVotingPhase(true);
  setCurrentVoterIndex(0);
}

    if (parsed.scores) {
      setScores(parsed.scores);
    } else {
      const initialScores: Record<string, number> = {};
      parsed.participants.forEach((p) => {
        initialScores[p] = 0;
      });
      setScores(initialScores);
    }
    setVotes(parsed.votes ?? {});
    setRequests(parsed.requests ?? []);
  }, [code]);
  */


useEffect(() => {
  async function fetchEvent() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) {
      console.error("Errore fetch evento:", error);
      return;
    }

   const parsed = data.data as SavedEvent;
const localMe = localStorage.getItem("fantastories_me") ?? "";

if (parsed.eventPack === "vacanza") {
  const initialDayScores: Record<string, number> = {};

  parsed.participants.forEach((p: string) => {
    initialDayScores[p] = 0;
  });

  const updatedEvent = {
    ...parsed,
    currentDay: parsed.currentDay ?? 1,
    dayParticipantScores: parsed.dayParticipantScores ?? initialDayScores,
    dailyScores: parsed.dailyScores ?? {},
    totalScores: parsed.totalScores ?? initialDayScores,
  };

  setEventData({
    ...updatedEvent,
    me: localMe,
  });
} else {
  setEventData({
    ...parsed,
    me: localMe,
  });
}

const myRoster = parsed.rosters?.[localMe] ?? [];
if (localMe && myRoster.length === 0) {
  setVotingPhase(true);
  setCurrentVoterIndex(0);
}

    if (parsed.scores) {
      setScores(parsed.scores);
    } else {
      const initialScores: Record<string, number> = {};
      parsed.participants.forEach((p) => {
        initialScores[p] = 0;
      });
      setScores(initialScores);
    }

    setVotes(parsed.votes ?? {});
    setRequests(parsed.requests ?? []);
  }

  fetchEvent();
}, [code]);

  useEffect(() => {
  if (!eventData || votingPhase || isChoosingRoster || isApplyingRemoteUpdate) return;

  const updatedEvent: SavedEvent = {
    ...eventData,
    me: "",
    scores,
    requests,
    votes,
    participantCosts: eventData.participantCosts,
    currentDay: eventData.currentDay,
    dayParticipantScores: eventData.dayParticipantScores,
    dailyScores: eventData.dailyScores,
    totalScores: eventData.totalScores,
    generatedEvents: eventData.generatedEvents,
  };

  async function saveEvent() {
    const { error } = await supabase
      .from("events")
      .update({
        data: updatedEvent,
      })
      .eq("code", code);

    if (error) {
      console.error("Errore update evento:", error);
    }
  }

  saveEvent();
}, [
  scores,
  requests,
  votes,
  eventData?.rosters,
  eventData?.participantCosts,
  eventData?.currentDay,
  eventData?.dayParticipantScores,
  eventData?.dailyScores,
  eventData?.totalScores,
  eventData?.generatedEvents,
  code,
  votingPhase,
  isChoosingRoster,
]);

  const canAssign =
    eventData?.scoreMode !== "arbitro" || eventData?.me === eventData?.referee;

  const allEvents = eventData?.generatedEvents?.allEvents ?? [];

  const isMultiDayVacation = eventData?.eventPack === "vacanza";
  const visiblePlayers = Array.from(
  new Set([
    ...(eventData?.players ?? []),
    ...Object.keys(eventData?.rosters ?? {}),
  ])
);

  const bonus = useMemo(
    () => allEvents.filter((e) => e.points > 0 && !e.tags?.includes("epico")),
    [allEvents]
  );

  const epicBonus = useMemo(
    () => allEvents.filter((e) => e.points > 0 && e.tags?.includes("epico")),
    [allEvents]
  );

  const malus = useMemo(
    () => allEvents.filter((e) => e.points < 0 && !e.tags?.includes("epico")),
    [allEvents]
  );

  const epicMalus = useMemo(
    () => allEvents.filter((e) => e.points < 0 && e.tags?.includes("epico")),
    [allEvents]
  );

  const playerRanking = useMemo(() => {
  if (!eventData) return [];

  const sourceScores = isMultiDayVacation
    ? eventData.dayParticipantScores ?? {}
    : scores;

  return [...visiblePlayers]
    .map((player) => {
      const team = eventData.rosters[player] ?? [];
      const total = team.reduce(
        (sum, member) => sum + (sourceScores[member] ?? 0),
        0
      );

      return {
        player,
        team,
        total,
      };
    })
    .sort((a, b) => b.total - a.total);
}, [eventData, scores, isMultiDayVacation, visiblePlayers]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 1800);
  }

  async function refreshEvent() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !data) {
    console.error("Errore refresh evento:", error);
    showToast("Errore aggiornamento");
    return;
  }

  const parsed = data.data as SavedEvent;
  const localMe = localStorage.getItem("fantastories_me") ?? "";

  setEventData({
    ...parsed,
    me: localMe,
  });

  setScores(parsed.scores ?? {});
  setRequests(parsed.requests ?? []);
  setVotes(parsed.votes ?? {});
  setHiddenRequestIds([]);

  showToast("Evento aggiornato");
}

  function renderPoints(points: number) {
    return (
      <span
        style={{
          color: points >= 0 ? "#4ade80" : "#f87171",
          fontWeight: 800,
        }}
      >
        {points > 0 ? "+" : ""}
        {points}
      </span>
    );
  }

  async function assignDirectToParticipant(name: string) {
  if (!selectedEvent || !eventData) return;

  const { data: latestData, error: latestError } = await supabase
    .from("events")
    .select("*")
    .eq("code", code)
    .single();

  if (latestError || !latestData) {
    console.error("Errore recupero evento:", latestError);
    alert("Errore recupero evento");
    return;
  }

  const latestEvent = latestData.data as SavedEvent;

  if (isMultiDayVacation) {
    const currentDayScores = latestEvent.dayParticipantScores ?? {};
    const updatedDayScores = {
      ...currentDayScores,
      [name]: (currentDayScores[name] ?? 0) + selectedEvent.points,
    };

    const updatedEvent: SavedEvent = {
      ...latestEvent,
      me: "",
      dayParticipantScores: updatedDayScores,
    };

    const { error } = await supabase
      .from("events")
      .update({ data: updatedEvent })
      .eq("code", code);

    if (error) {
      console.error("Errore salvataggio punti:", error);
      alert("Errore salvataggio punti");
      return;
    }

    setEventData({
      ...updatedEvent,
      me: eventData.me,
    });
  } else {
    const updatedScores = {
      ...(latestEvent.scores ?? {}),
      [name]: ((latestEvent.scores ?? {})[name] ?? 0) + selectedEvent.points,
    };

    const updatedEvent: SavedEvent = {
      ...latestEvent,
      me: "",
      scores: updatedScores,
    };

    const { error } = await supabase
      .from("events")
      .update({ data: updatedEvent })
      .eq("code", code);

    if (error) {
      console.error("Errore salvataggio punti:", error);
      alert("Errore salvataggio punti");
      return;
    }

    setScores(updatedScores);
    setEventData({
      ...updatedEvent,
      me: eventData.me,
    });
  }

  showToast(
    `${selectedEvent.points > 0 ? "+" : ""}${selectedEvent.points} a ${name}`
  );
  setSelectedEvent(null);
}

 async function assignDirectToAll() {
  if (!selectedEvent || !eventData) return;

  const { data: latestData, error: latestError } = await supabase
    .from("events")
    .select("*")
    .eq("code", code)
    .single();

  if (latestError || !latestData) {
    console.error("Errore recupero evento:", latestError);
    alert("Errore recupero evento");
    return;
  }

  const latestEvent = latestData.data as SavedEvent;

  if (isMultiDayVacation) {
    const updatedDayScores = { ...(latestEvent.dayParticipantScores ?? {}) };

    latestEvent.participants.forEach((p) => {
      updatedDayScores[p] = (updatedDayScores[p] ?? 0) + selectedEvent.points;
    });

    const updatedEvent: SavedEvent = {
      ...latestEvent,
      me: "",
      dayParticipantScores: updatedDayScores,
    };

    const { error } = await supabase
      .from("events")
      .update({ data: updatedEvent })
      .eq("code", code);

    if (error) {
      console.error("Errore salvataggio punti:", error);
      alert("Errore salvataggio punti");
      return;
    }

    setEventData({
      ...updatedEvent,
      me: eventData.me,
    });
  } else {
    const updatedScores = { ...(latestEvent.scores ?? {}) };

    latestEvent.participants.forEach((p) => {
      updatedScores[p] = (updatedScores[p] ?? 0) + selectedEvent.points;
    });

    const updatedEvent: SavedEvent = {
      ...latestEvent,
      me: "",
      scores: updatedScores,
    };

    const { error } = await supabase
      .from("events")
      .update({ data: updatedEvent })
      .eq("code", code);

    if (error) {
      console.error("Errore salvataggio punti:", error);
      alert("Errore salvataggio punti");
      return;
    }

    setScores(updatedScores);
    setEventData({
      ...updatedEvent,
      me: eventData.me,
    });
  }

  showToast(
    `${selectedEvent.points > 0 ? "+" : ""}${selectedEvent.points} a tutti`
  );
  setSelectedEvent(null);
}

 async function requestForParticipant(name: string) {
  if (!selectedEvent || !eventData) return;

  const request: EventRequest = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    eventId: selectedEvent.id,
    eventText: selectedEvent.text,
    target: name,
    points: selectedEvent.points,
    requestedBy: eventData.me || "Giocatore",
    type: selectedEvent.type,
  };

  const { data: latestData, error: latestError } = await supabase
    .from("events")
    .select("*")
    .eq("code", code)
    .single();

  if (latestError || !latestData) {
    console.error("Errore recupero richieste correnti:", latestError);
    alert("Errore recupero richieste");
    return;
  }

  const latestEvent = latestData.data as SavedEvent;
  const updatedRequests = [request, ...(latestEvent.requests ?? [])];

  const updatedEvent: SavedEvent = {
    ...latestEvent,
    me: "",
    requests: updatedRequests,
  };

  const { error } = await supabase
    .from("events")
    .update({ data: updatedEvent })
    .eq("code", code);

  if (error) {
    console.error("Errore invio richiesta:", error);
    alert("Errore invio richiesta");
    return;
  }

  setRequests(updatedRequests);
  showToast(`Segnalato all’arbitro: ${selectedEvent.text} → ${name}`);
  setSelectedEvent(null);
}

  async function requestForAll() {
  if (!selectedEvent || !eventData) return;

  const request: EventRequest = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    eventId: selectedEvent.id,
    eventText: selectedEvent.text,
    target: "all",
    points: selectedEvent.points,
    requestedBy: eventData.me || "Giocatore",
    type: selectedEvent.type,
  };

  const { data: latestData, error: latestError } = await supabase
    .from("events")
    .select("*")
    .eq("code", code)
    .single();

  if (latestError || !latestData) {
    console.error("Errore recupero richieste correnti:", latestError);
    alert("Errore recupero richieste");
    return;
  }

  const latestEvent = latestData.data as SavedEvent;
  const updatedRequests = [request, ...(latestEvent.requests ?? [])];

  const updatedEvent: SavedEvent = {
    ...latestEvent,
    me: "",
    requests: updatedRequests,
  };

  const { error } = await supabase
    .from("events")
    .update({ data: updatedEvent })
    .eq("code", code);

  if (error) {
    console.error("Errore invio richiesta:", error);
    alert("Errore invio richiesta");
    return;
  }

  setRequests(updatedRequests);
  showToast(`Segnalato all’arbitro: ${selectedEvent.text} → tutti`);
  setSelectedEvent(null);
}
 function approveRequest(request: EventRequest) {
  if (!eventData) return;

  setHiddenRequestIds((prev) => [...prev, request.id]);

  if (isMultiDayVacation) {
    const updatedDayScores = { ...(eventData.dayParticipantScores ?? {}) };

    if (request.target === "_all_") {
      eventData.participants.forEach((p) => {
        updatedDayScores[p] = (updatedDayScores[p] ?? 0) + request.points;
      });

      setEventData({
        ...eventData,
        dayParticipantScores: updatedDayScores,
      });

      showToast(
        `${request.points > 0 ? "+" : ""}${request.points} a tutti`
      );
    } else {
      updatedDayScores[request.target] =
        (updatedDayScores[request.target] ?? 0) + request.points;

      setEventData({
        ...eventData,
        dayParticipantScores: updatedDayScores,
      });

      showToast(
        `${request.points > 0 ? "+" : ""}${request.points} a ${request.target}`
      );
    }
  } else {
    if (request.target === "_all_") {
      const updated = { ...scores };

      eventData.participants.forEach((p) => {
        updated[p] = (updated[p] ?? 0) + request.points;
      });

      setScores(updated);

      showToast(
        `${request.points > 0 ? "+" : ""}${request.points} a tutti`
      );
    } else {
      setScores((prev) => ({
        ...prev,
        [request.target]: (prev[request.target] ?? 0) + request.points,
      }));

      showToast(
        `${request.points > 0 ? "+" : ""}${request.points} a ${request.target}`
      );
    }
  }

  setRequests((prev) => prev.filter((r) => r.id !== request.id));
}

 async function rejectRequest(requestId: string) {
  if (!eventData) return;

  setHiddenRequestIds((prev) => [...prev, requestId]);

  const updatedRequests = requests.filter((r) => r.id !== requestId);

  const updatedEvent: SavedEvent = {
    ...eventData,
    me: "",
    requests: updatedRequests,
    scores,
    votes,
    participantCosts: eventData.participantCosts,
    currentDay: eventData.currentDay,
    dayParticipantScores: eventData.dayParticipantScores,
    dailyScores: eventData.dailyScores,
    totalScores: eventData.totalScores,
    generatedEvents: eventData.generatedEvents,
  };

  const { error } = await supabase
    .from("events")
    .update({ data: updatedEvent })
    .eq("code", code);

  if (error) {
    console.error("Errore rifiuto richiesta:", error);
    alert("Errore rifiuto richiesta");
    return;
  }

  setRequests(updatedRequests);
  showToast("Richiesta rifiutata");
}

  function renderEventCard(event: EventItem) {
    return (
      <button
        key={event.id}
        onClick={() => setSelectedEvent(event)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: 14,
          borderRadius: 16,
          border:
            selectedEvent?.id === event.id
              ? "1px solid rgba(255,59,212,.7)"
              : event.tags?.includes("epico")
              ? "1px solid rgba(255,59,212,.55)"
              : "1px solid rgba(255,255,255,.10)",
          background:
            selectedEvent?.id === event.id
              ? "rgba(255,59,212,.12)"
              : "rgba(255,255,255,.05)",
          cursor: "pointer",
        }}
      >
        <div style={{ fontWeight: 700 }}>{event.text}</div>
        <div style={{ marginTop: 6, fontSize: 14 }}>
          {renderPoints(event.points)} {event.type === "all" && "• per tutti"}
        </div>
      </button>
    );
  }

const currentVoter = eventData?.me ?? "";

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
function hasPlayerCompletedVote(playerName: string) {
  const current = votes[playerName];
  return !!(current?.iconico && current?.protagonista && current?.tranquillo);
}

function haveAllPlayersVoted() {
  if (!eventData) return false;

  const latestVotes = eventData.votes ?? {};

  return eventData.players.every((player) => {
    const vote = latestVotes[player];
    return !!(vote?.iconico && vote?.protagonista && vote?.tranquillo);
  });
}

async function goToNextVoter() {
  if (!eventData) return;

  if (!isCurrentVoterComplete()) {
    alert("Completa tutte e 3 le risposte");
    return;
  }

  const localMe = localStorage.getItem("fantastories_me") ?? "";

const { data: latestData, error: latestError } = await supabase
  .from("events")
  .select("*")
  .eq("code", code)
  .single();

if (latestError || !latestData) {
  console.error("Errore recupero voti correnti:", latestError);
  alert("Errore recupero voti");
  return;
}

const latestEventBeforeSave = latestData.data as SavedEvent;

const mergedVotes = {
  ...(latestEventBeforeSave.votes ?? {}),
  [localMe]: votes[localMe],
};

const updatedEvent: SavedEvent = {
  ...latestEventBeforeSave,
  me: "",
  scores: latestEventBeforeSave.scores ?? scores,
  requests: latestEventBeforeSave.requests ?? requests,
  votes: mergedVotes,
  participantCosts: latestEventBeforeSave.participantCosts,
  currentDay: latestEventBeforeSave.currentDay,
  dayParticipantScores: latestEventBeforeSave.dayParticipantScores,
  dailyScores: latestEventBeforeSave.dailyScores,
  totalScores: latestEventBeforeSave.totalScores,
  generatedEvents: latestEventBeforeSave.generatedEvents,
};

const { error } = await supabase
  .from("events")
  .update({ data: updatedEvent })
  .eq("code", code);

if (error) {
  console.error("Errore salvataggio voto:", error);
  alert("Errore salvataggio voto");
  return;
}
  setEventData({
    ...updatedEvent,
    me: localMe,
  });

  showToast("Voto salvato. Aspetta gli altri giocatori");
  setVotingPhase(true);
  setWaitingForOthers(true);
}

useEffect(() => {
  if (!waitingForOthers || isChoosingRoster) return;

  const interval = setInterval(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) return;

    const parsed = data.data as SavedEvent;
    const localMe = localStorage.getItem("fantastories_me") ?? "";

    setEventData({
      ...parsed,
      me: localMe,
    });

    setVotes(parsed.votes ?? {});
    setRequests(parsed.requests ?? []);
    setScores(parsed.scores ?? {});

    if (parsed.participantCosts) {
      setWaitingForOthers(false);
      setVotingPhase(false);
      setIsChoosingRoster(true);
      showToast("Tutti hanno votato");
      return;
    }

    const latestVotes = parsed.votes ?? {};
    const allPlayersVoted = (parsed.players ?? []).every((player) => {
      const vote = latestVotes[player];
      return !!(vote?.iconico && vote?.protagonista && vote?.tranquillo);
    });

    if (!allPlayersVoted) return;

    const costs: Record<string, number> = {};
    const factor = parsed.players.length > 0 ? 10 / parsed.players.length : 1;

    parsed.participants.forEach((p) => {
      let iconicoVotes = 0;
      let protagonistaVotes = 0;
      let tranquilloVotes = 0;

      Object.values(latestVotes).forEach((vote) => {
        if (vote.iconico === p) iconicoVotes += 1;
        if (vote.protagonista === p) protagonistaVotes += 1;
        if (vote.tranquillo === p) tranquilloVotes += 1;
      });

      const rawCost =
        15 +
        iconicoVotes * 2 * factor +
        protagonistaVotes * 2 * factor -
        tranquilloVotes * 1 * factor;

      costs[p] = Math.max(10, Math.min(35, Math.round(rawCost)));
    });

    const updatedEvent: SavedEvent = {
      ...parsed,
      me: "",
      participantCosts: costs,
    };

    const { error: updateError } = await supabase
      .from("events")
      .update({ data: updatedEvent })
      .eq("code", code);

    if (updateError) {
      console.error("Errore salvataggio costi finali:", updateError);
      return;
}
      setEventData({
  ...updatedEvent,
  me: localMe,
});

setVotes(latestVotes);
setWaitingForOthers(false);
setVotingPhase(false);
setIsChoosingRoster(true);
showToast("Tutti hanno votato");
return;
  }, 1500);

  return () => clearInterval(interval);
}, [ code, isChoosingRoster, waitingForOthers ]);

async function closeDay() {
  if (!eventData) return;
  if (eventData.eventPack !== "vacanza") return;

  const currentDay = eventData.currentDay ?? 1;
  const currentDayScores = eventData.dayParticipantScores ?? {};
  const totalDays = Number(eventData.vacationDays ?? 1);

if (currentDay > totalDays) return;

  const previousDailyScores = eventData.dailyScores ?? {};
  const previousTotalScores = eventData.totalScores ?? {};

  const newDailyScores = {
    ...previousDailyScores,
    [currentDay]: currentDayScores,
  };

  const newTotalScores: Record<string, number> = {};

  eventData.participants.forEach((p) => {
    newTotalScores[p] =
      (previousTotalScores[p] ?? 0) + (currentDayScores[p] ?? 0);
  });

  const resetDayScores: Record<string, number> = {};
  eventData.participants.forEach((p) => {
    resetDayScores[p] = 0;
  });

const nextDay = currentDay >= totalDays ? totalDays : currentDay + 1;

  const updatedEvent: SavedEvent = {
    ...eventData,
    me: "",
    dailyScores: newDailyScores,
    totalScores: newTotalScores,
    dayParticipantScores: resetDayScores,
    currentDay: nextDay,
  };

  const { error } = await supabase
    .from("events")
    .update({ data: updatedEvent })
    .eq("code", code);

  if (error) {
    console.error("Errore chiusura giornata:", error);
    alert("Errore nella chiusura giornata");
    return;
  }

  const localMe = localStorage.getItem("fantastories_me") ?? "";

  setEventData({
    ...updatedEvent,
    me: localMe,
  });

  setScores(newTotalScores);
 showToast(
  currentDay >= totalDays
    ? "Vacanza terminata"
    : `Giornata ${currentDay} chiusa.`
 );
}


useEffect(() => {
  if (votingPhase || isChoosingRoster) return;

  const interval = setInterval(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) return;

    const parsed = data.data as SavedEvent;
    const localMe = localStorage.getItem("fantastories_me") ?? "";

    setEventData({
      ...parsed,
      me: localMe,
    });

    setScores(parsed.scores ?? {});
    setRequests(parsed.requests ?? []);
    setVotes(parsed.votes ?? {});
    setHiddenRequestIds([]);
  }, 500);

  return () => clearInterval(interval);
}, [code, votingPhase, isChoosingRoster]);

/*
useEffect(() => {
  if (!code) return;

  const channel = supabase
    .channel(`event-${code}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "events",
        filter: `code=eq.${code}`,
      },
      (payload) => {
        const row = payload.new as { data?: SavedEvent };
        const updated = row.data;
        if (!updated) return;

        const localMe = localStorage.getItem("fantastories_me") ?? "";

        setIsApplyingRemoteUpdate(true);

setEventData({
  ...updated,
  me: localMe,
});

setScores(updated.scores ?? {});
setRequests(updated.requests ?? []);
setVotes(updated.votes ?? {});
setHiddenRequestIds([]);

setTimeout(() => {
  setIsApplyingRemoteUpdate(false);
}, 0);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [code]);
*/

  if (!eventData) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
          Nessun evento trovato.
        </div>
      </main>
    );
  }

if (votingPhase) {
  return (
    <main style={{ minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="h2" style={{ textAlign: "center" }}>
            Votazione pre-partita
          </div>

          <div className="muted" style={{ marginTop: 8, textAlign: "center" }}>
            Sta votando: <b>{currentVoter || "NESSUNO"}</b>
          </div>

<div className="muted" style={{ marginTop: 6, textAlign: "center" }}>
  Voto completo: <b>{isCurrentVoterComplete() ? "SI" : "NO"}</b>
</div>

<div className="muted" style={{ marginTop: 6, textAlign: "center" }}>
  Tutti hanno votato: <b>{haveAllPlayersVoted() ? "SI" : "NO"}</b>
</div>

{waitingForOthers && (
  <div
    style={{
      marginTop: 12,
      padding: 12,
      borderRadius: 12,
      background: "rgba(255,255,255,.08)",
      textAlign: "center",
      fontWeight: 700,
    }}
  >
    Hai votato. Attendi che tutti gli altri completino la votazione...
  </div>
)}

{isCurrentVoterComplete() && !haveAllPlayersVoted() && (
  <div
    style={{
      marginTop: 12,
      padding: 12,
      borderRadius: 12,
      background: "rgba(255,255,255,.06)",
      textAlign: "center",
      fontWeight: 700,
    }}
  >
    Hai votato. Attendi che tutti gli altri completino la votazione...
  </div>
)}

<div className="muted" style={{ marginTop: 6, textAlign: "center" }}>
  Giocatori: <b>{eventData?.players?.join(", ") || "-"}</b>
</div>

<div className="muted" style={{ marginTop: 6, textAlign: "center" }}>
  Numero giocatori: <b>{eventData?.players?.length ?? 0}</b>
</div>

<div className="muted" style={{ marginTop: 6, textAlign: "center" }}>
  Voti salvati: <b>{Object.keys(votes).join(", ") || "-"}</b>
</div>

          <div style={{ marginTop: 20, display: "grid", gap: 18 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                Chi sarà il più iconico?
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {eventData.participants.map((p) => (
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
                {eventData.participants.map((p) => (
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
                {eventData.participants.map((p) => (
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
            <button className="btn" onClick={() => window.history.back()}>
              Indietro
            </button>

          <button
  className="btn btnPrimary"
  onClick={goToNextVoter}
  disabled={!isCurrentVoterComplete() || waitingForOthers}
  style={{
    opacity: !isCurrentVoterComplete() || waitingForOthers ? 0.5 : 1,
  }}
>
  {waitingForOthers ? "In attesa..." : "Vota e continua"}
</button>

          </div>
        </div>
      </div>
    </main>
  );
}

  const rosterMax = getRosterMax(eventData.participants.length);
 const playerCosts: Record<string, number> = {};

eventData.participants.forEach((p) => {
  playerCosts[p] = eventData.participantCosts?.[p] ?? 15;
});
const budgetMax = rosterMax === 2 ? 40 : rosterMax === 3 ? 60 : 100;

const myRosterCost = (eventData.rosters?.[eventData.me] ?? []).reduce(
  (sum: number, player: string) => sum + (playerCosts[player] ?? 0),
  0
);

 const myRoster = eventData?.rosters?.[eventData.me] ?? [];

const noOneHasRoster = !Object.values(eventData.rosters ?? {}).some(
  (r) => r.length > 0
);

const needsRoster =
  eventData.me &&
  (!eventData.rosters ||
    !eventData.rosters[eventData.me] ||
    eventData.rosters[eventData.me].length === 0 ||
    noOneHasRoster);

    if (isChoosingRoster) {
  const myRoster = eventData.rosters?.[eventData.me] ?? [];

  return (
    <main style={{ minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="h2" style={{ textAlign: "center" }}>
            Crea la tua squadra
          </div>

         <div className="muted" style={{ marginTop: 8, textAlign: "center" }}>
  Selezionati: <b>{myRoster.length}</b> / <b>{rosterMax}</b>
</div>

<div className="muted" style={{ marginTop: 6 }}>
  Budget: <b>{myRosterCost}</b> / <b>{budgetMax}</b> Storix
</div>

          <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
    marginTop: 16,
  }}
>
  {eventData.participants.map((p) => {
      const checked = myRoster.includes(p);
      const isMe = p === eventData.me;

      return (
        <button
          key={p}
          className="badge"
          style={{
            cursor: isMe ? "not-allowed" : "pointer",
            opacity: isMe ? 0.45 :checked ? 1 : 0.75,
            borderColor: checked
              ? "rgba(255,59,212,.7)"
              : "rgba(255,255,255,.12)",
            background: checked
              ? "rgba(255,59,212,.15)"
              : "rgba(255,255,255,.05)",
            fontWeight: checked ? 800 : 600,
            padding: 14,
            borderRadius: 14,
            textAlign: "center",
          }}
          onClick={async () => {
            if (isMe) return;
            const current = eventData.rosters?.[eventData.me] ?? [];

            let updatedRoster;

           if (checked) {
  updatedRoster = current.filter((x: string) => x !== p);
} else {
  const newCost =
    current.reduce(
      (sum: number, x: string) => sum + (playerCosts[x] ?? 0),
      0
    ) + (playerCosts[p] ?? 0);

  if (current.length >= rosterMax || newCost > budgetMax) {
    showToast("Hai superato il budget disponibile");
    return;
  }

  updatedRoster = [...current, p];
}

            const updatedEvent = {
              ...eventData,
              rosters: {
                ...eventData.rosters,
                [eventData.me]: updatedRoster,
              },
            };

            await supabase
  .from("events")
  .update({ data: { ...updatedEvent, me: "" } })
  .eq("code", code);

            setEventData(updatedEvent);
        }}
        >
  {p} {isMe ? "(Tu)" : ""} • {playerCosts[p]} Storix
</button>
      );
    })}
</div>

<div style={{ marginTop: 12, fontSize: 13, textAlign: "center", opacity: 0.8 }}>
  Squadra attuale: {myRoster.length ? myRoster.join(", ") : "—"}
</div>

          <div style={{ marginTop: 20 }}>
            <button
              className="btn btnPrimary"
              disabled={myRoster.length === 0}
             onClick={async () => {
  if (!eventData) return;

 const { data: latestData, error: latestFetchError } = await supabase
  .from("events")
  .select("*")
  .eq("code", code)
  .single();

if (latestFetchError || !latestData) {
  console.error("Errore recupero evento prima del salvataggio squadra:", latestFetchError);
  alert("Errore recupero evento");
  return;
}

const latestEvent = latestData.data as SavedEvent;

const updatedEvent: SavedEvent = {
  ...latestEvent,
  me: "",
  rosters: {
    ...(latestEvent.rosters ?? {}),
    [eventData.me]: eventData.rosters?.[eventData.me] ?? [],
  },
  scores,
  requests,
  votes,
  participantCosts: eventData.participantCosts,
  currentDay: eventData.currentDay,
  dayParticipantScores: eventData.dayParticipantScores,
  dailyScores: eventData.dailyScores,
  totalScores: eventData.totalScores,
  generatedEvents: eventData.generatedEvents,
};

  const { error } = await supabase
    .from("events")
    .update({ data: updatedEvent })
    .eq("code", code);

  if (error) {
    console.error("Errore salvataggio squadra:", error);
    alert("Errore salvataggio squadra");
    return;
  }

  setIsChoosingRoster(false);
  await refreshEvent();
  showToast("Squadra salvata!");
}}
              style={{
                width: "100%",
                opacity: myRoster.length === 0 ? 0.5 : 1,
              }}
            >
              Conferma squadra
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

  return (
    <main style={{ minHeight: "100vh", padding: 20 }}>
      <div
  style={{
    maxWidth: 620,
    margin: "0 auto",
    display: "grid",
    gap: 18,
    paddingBottom: 110,
  }}
>
        {toast && (
          <div
            style={{
              position: "fixed",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "12px 20px",
              borderRadius: 14,
              background: "linear-gradient(90deg, #ff00cc, #3333ff)",
              color: "white",
              fontWeight: 700,
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              zIndex: 9999,
            }}
          >
            {toast}
          </div>
        )}

        <div className="card" style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div className="h1">Evento in corso</div>
              <div style={{ marginTop: 12 }}>

<button
  className="btn"
  onClick={refreshEvent}
  style={{ marginBottom: 10 }}
>
  🔄 Aggiorna
</button>

  <div className="muted" style={{ marginBottom: 6 }}>
    Io sono:
  </div>

  <select
    value={eventData.me || ""}
    onChange={(e) => {
      const newMe = e.target.value;

      const updated = {
        ...eventData,
        me: newMe,
      };

      setEventData(updated);

      localStorage.setItem(
        `fantastories-event-${code}`,
        JSON.stringify({
          ...updated,
          scores,
          requests,
        })
      );
    }}
    style={{
      width: "100%",
      padding: 10,
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,.2)",
      background: "rgba(255,255,255,.05)",
      color: "white",
    }}
  >
    <option value="">Seleziona</option>
    {eventData.participants.map((p) => (
      <option key={p} value={p}>
        {p} {p === eventData.referee ? "(arbitro)" : ""}
      </option>
    ))}
  </select>
</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Codice: <b>{eventData.code}</b>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="badge">LIVE</span>
              <span className="badge">{eventData.eventPack}</span>
              {eventData.eventGroup && (
                <span className="badge">{eventData.eventGroup}</span>
              )}
              {eventData.vacationLocation && (
                <span className="badge">{eventData.vacationLocation}</span>
              )}
            </div>
          </div>
        </div>

{view === "home" && (
  <div className="card" style={{ padding: 18 }}>
    <div className="h2">Home</div>

    <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
      <div
        style={{
          padding: 14,
          borderRadius: 14,
          background: "rgba(255,255,255,.05)",
        }}
      >
        <div style={{ fontWeight: 800 }}>Evento attuale</div>
        <div className="muted" style={{ marginTop: 6 }}>
          {eventData.eventPack}
          {eventData.eventGroup ? ` • ${eventData.eventGroup}` : ""}
          {eventData.vacationLocation ? ` • ${eventData.vacationLocation}` : ""}
        </div>
      </div>

      <button className="btn btnPrimary" onClick={() => setView("eventi")}>
        Vai all’evento in corso
      </button>

      <button className="btn" onClick={() => setView("classifiche")}>
        Vai a classifiche
      </button>

      <button className="btn" onClick={() => setView("squadre")}>
        Vai alle squadre
      </button>
    </div>
  </div>
)}

       {view === "eventi" && (
  <>
  {isMultiDayVacation && (
  <div className="card" style={{ padding: 16 }}>
    <div style={{ fontWeight: 800 }}>
      Giorno {eventData.currentDay ?? 1} / {eventData.vacationDays}
    </div>

    <div className="muted" style={{ marginTop: 6 }}>
      Classifica del giorno in corso + totale vacanza
    </div>

    <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
      {[...eventData.participants]
        .sort(
          (a, b) =>
            (eventData.totalScores?.[b] ?? 0) - (eventData.totalScores?.[a] ?? 0)
        )
        .map((p) => (
          <div
            key={`total-${p}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 10,
              borderRadius: 12,
              background: "rgba(255,255,255,.05)",
            }}
          >
            <span style={{ fontWeight: 700 }}>{p}</span>
            <span>{renderPoints(eventData.totalScores?.[p] ?? 0)}</span>
          </div>
        ))}
    </div>

    <button
      className="btn btnPrimary"
      style={{ marginTop: 12 }}
      onClick={closeDay}
    >
      {Number(eventData.currentDay ?? 1) >= Number(eventData.vacationDays ?? 1)
        ? "Termina vacanza"
        : "Chiudi giornata"}
    </button>
  </div>
)}
    <div className="card" style={{ padding: 18 }}>
      <div className="h2">Partecipanti evento</div>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {[...eventData.participants]
  .sort((a, b) =>
    isMultiDayVacation
      ? (eventData.dayParticipantScores?.[b] ?? 0) - (eventData.dayParticipantScores?.[a] ?? 0)
      : (scores[b] ?? 0) - (scores[a] ?? 0)
  )
          .map((p) => (
            <div
              key={p}
              style={{
                padding: 12,
                borderRadius: 14,
                background: "rgba(255,255,255,.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700 }}>{p}</span>
              <span>
  {renderPoints(
    isMultiDayVacation
      ? eventData.dayParticipantScores?.[p] ?? 0
      : scores[p] ?? 0
  )}
</span>
            </div>
          ))}
      </div>
    </div>

    <div style={{ height: 12 }} />
  </>
)}

        {view === "classifiche" && (
  <>
    <div className="card" style={{ padding: 18 }}>
      <div className="h2">Classifiche</div>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {playerRanking.map((row, index) => (
          <div
            key={row.player}
            style={{
              padding: 12,
              borderRadius: 14,
              background:
                index === 0
                  ? "linear-gradient(90deg, rgba(255,0,204,.18), rgba(51,51,255,.18))"
                  : "rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 800 }}>{row.player}</span>
              <span style={{ fontWeight: 800 }}>{row.total} pt</span>
            </div>

            <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
              Squadra: {row.team.length ? row.team.join(", ") : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ height: 12 }} />
  </>
)}

{view === "squadre" && (
  <div className="card" style={{ padding: 18 }}>
    <div className="h2">Le tue squadre</div>

    <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
      {visiblePlayers.map((player) => {
        const team = eventData.rosters[player] ?? [];
        const total = team.reduce(
  (sum, member) =>
    sum +
    ((isMultiDayVacation
      ? eventData.dayParticipantScores?.[member]
      : scores[member]) ?? 0),
  0
);

        return (
          <div
            key={player}
            style={{
              padding: 12,
              borderRadius: 14,
              background: "rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 800 }}>{player}</span>
              <span style={{ fontWeight: 800 }}>{total} pt</span>
            </div>

            <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
              Squadra: {team.length ? team.join(", ") : "—"}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

{view === "profilo" && (
  <div className="card" style={{ padding: 18 }}>
    <div className="h2">Profilo</div>

    <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
      <div
        style={{
          padding: 12,
          borderRadius: 14,
          background: "rgba(255,255,255,.05)",
        }}
      >
        <div style={{ fontWeight: 700 }}>Io sono</div>
        <div className="muted" style={{ marginTop: 6 }}>
          {eventData.me || "—"}
        </div>
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: 14,
          background: "rgba(255,255,255,.05)",
        }}
      >
        <div style={{ fontWeight: 700 }}>Ruolo</div>
        <div className="muted" style={{ marginTop: 6 }}>
          {eventData.me === eventData.referee ? "Arbitro" : "Giocatore"}
        </div>
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: 14,
          background: "rgba(255,255,255,.05)",
        }}
      >
        <div style={{ fontWeight: 700 }}>Evento</div>
        <div className="muted" style={{ marginTop: 6 }}>
          {eventData.eventPack}
          {eventData.eventGroup ? ` • ${eventData.eventGroup}` : ""}
          {eventData.vacationLocation ? ` • ${eventData.vacationLocation}` : ""}
        </div>
      </div>
    </div>
  </div>
)}

        {view === "bonus" && (
          <>
            {eventData.scoreMode === "arbitro" && canAssign && requests.length > 0 && (
              <div className="card" style={{ padding: 18 }}>
                <div className="h2">Richieste in attesa</div>

                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                 {requests
  .filter((request) => !hiddenRequestIds.includes(request.id))
  .map((request) => (
                    <div
                      key={request.id}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        background: "rgba(255,255,255,.05)",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{request.eventText}</div>
                      <div className="muted" style={{ marginTop: 6 }}>
                        {request.requestedBy} →{" "}
                        {request.target === "_all_" ? "tutti" : request.target} •{" "}
                        {request.points > 0 ? "+" : ""}
                        {request.points}
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button
                          className="btn btnPrimary"
                          onClick={() => approveRequest(request)}
                        >
                          Approva
                        </button>
                        <button
                          className="btn"
                          onClick={() => rejectRequest(request.id)}
                        >
                          Rifiuta
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card" style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div className="h2">Console eventi</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    {canAssign
                      ? "Seleziona un evento e poi il partecipante."
                      : "Seleziona un evento e segnala all’arbitro."}
                  </div>
                </div>

                <button
                  className="btn"
                  onClick={() => {
                    setSelectedEvent(null);
                    setView("eventi");
                  }}
                >
                  Chiudi console
                </button>
              </div>

              <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
                <div>
                  <div className="h2" style={{ fontSize: 18, marginBottom: 10 }}>
                    Bonus
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {bonus.map(renderEventCard)}
                  </div>
                </div>

                <div>
                  <div className="h2" style={{ fontSize: 18, marginBottom: 10 }}>
                    Bonus epici
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {epicBonus.map(renderEventCard)}
                  </div>
                </div>

                <div>
                  <div className="h2" style={{ fontSize: 18, marginBottom: 10 }}>
                    Malus
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {malus.map(renderEventCard)}
                  </div>
                </div>

                <div>
                  <div className="h2" style={{ fontSize: 18, marginBottom: 10 }}>
                    Malus epici
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {epicMalus.map(renderEventCard)}
                  </div>
                </div>
              </div>
            </div>

            {selectedEvent && (
              <div
                className="card"
                style={{
  padding: 18,
  position: "fixed",
  left: "50%",
  transform: "translateX(-50%)",
  width: "calc(100% - 32px)",
  maxWidth: 520,
  bottom: 90,
  border: "1px solid rgba(255,59,212,.4)",
  borderRadius: 18,
  background: "rgba(20,20,28,.98)",
  zIndex: 9999,
}}
              >
                <div style={{ fontWeight: 800 }}>{selectedEvent.text}</div>
                <div style={{ marginTop: 6 }}>{renderPoints(selectedEvent.points)}</div>

                {selectedEvent.type === "all" && (
                  <div style={{ marginTop: 14 }}>
                    {canAssign ? (
                      <button className="btn btnPrimary" onClick={assignDirectToAll}>
                        Assegna a tutti
                      </button>
                    ) : (
                      <button className="btn btnPrimary" onClick={requestForAll}>
                        Segnala all’arbitro per tutti
                      </button>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
  {eventData.participants.map((p) => (
    <button
      key={p}
      className="btn"
      onClick={() =>
        canAssign
          ? assignDirectToParticipant(p)
          : requestForParticipant(p)
      }
    >
      {canAssign ? `Assegna a ${p}` : `Segnala ${p}`}
    </button>
  ))}
</div>

<div style={{ marginTop: 12 }}>
  <button className="btn" onClick={() => setSelectedEvent(null)}>
    Annulla
  </button>
</div>
              </div>
            )}
          </>
        )}

{view !== "bonus" && (
  <button
    onClick={() => setView("bonus")}
    style={{
      position: "fixed",
      right: 20,
      bottom: 86,
      width: 58,
      height: 58,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      background: "linear-gradient(135deg, #ff00cc, #6a3cff)",
      color: "white",
      fontSize: 24,
      fontWeight: 800,
      boxShadow: "0 10px 24px rgba(0,0,0,.28)",
      zIndex: 999,
    }}
  >
    <>
  ⚡
  {requests.length > 0 && (
    <span
      style={{
        position: "relative",
        top: -4,
        right: -4,
        background: "#ff2f92",
        color: "white",
        fontSize: 10,
        fontWeight: 800,
        borderRadius: "50%",
        padding: "2px 6px",
        lineHeight: 1,
      }}
    >
      {requests.length > 9 ? "9+" : requests.length}
    </span>
  )}
</>
  </button>
)}
<div
  style={{
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "14px 16px calc(14px + env(safe-area-inset-bottom))",
    background: "rgba(10,10,14,.96)",
    borderTop: "1px solid rgba(255,255,255,.08)",
    backdropFilter: "blur(12px)",
    zIndex: 998,
  }}
>
  <div
    style={{
      maxWidth: 620,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1fr 1fr auto 1fr 1fr",
      gap: 8,
      alignItems: "end",
    }}
  >
    <button
      onClick={() => setView("classifiche")}
      style={{
        border: "none",
        borderRadius: 16,
        padding: "12px 8px",
        cursor: "pointer",
        background: view === "classifiche" ? "rgba(255,59,212,.16)" : "transparent",
        color: "white",
        fontWeight: view === "classifiche" ? 800 : 600,
        fontSize: 14,
      }}
    >
      <div style={{ fontSize: 18 }}>🏆</div>
      <div style={{ fontSize: 11 }}>Classifiche</div>
    </button>

    <button
      onClick={() => setView("eventi")}
      style={{
        border: "none",
        borderRadius: 16,
        padding: "12px 8px",
        cursor: "pointer",
        background: view === "eventi" ? "rgba(255,59,212,.16)" : "transparent",
        color: "white",
        fontWeight: view === "eventi" ? 800 : 600,
        fontSize: 14,
      }}
    >
      <div style={{ fontSize: 18 }}>🎮</div>
      <div style={{ fontSize: 11 }}>Eventi</div>
    </button>

    <button
      onClick={() => setView("home")}
      style={{
        width: 64,
        height: 64,
        marginBottom: 8,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background:
          view === "home"
            ? "linear-gradient(135deg, #ff00cc, #6a3cff)"
            : "linear-gradient(135deg, rgba(255,59,212,.75), rgba(106,60,255,.75))",
        color: "white",
        fontWeight: 800,
        boxShadow: "0 10px 24px rgba(0,0,0,.28)",
      }}
    >
      <div style={{ fontSize: 22 }}>🏠</div>
    </button>

    <button
      onClick={() => setView("squadre")}
      style={{
        border: "none",
        borderRadius: 16,
        padding: "12px 8px",
        cursor: "pointer",
        background: view === "squadre" ? "rgba(255,59,212,.16)" : "transparent",
        color: "white",
        fontWeight: view === "squadre" ? 800 : 600,
        fontSize: 14,
      }}
    >
      <div style={{ fontSize: 18 }}>👥</div>
      <div style={{ fontSize: 11 }}>Squadre</div>
    </button>

    <button
      onClick={() => setView("profilo")}
      style={{
        border: "none",
        borderRadius: 16,
        padding: "12px 8px",
        cursor: "pointer",
        background: view === "profilo" ? "rgba(255,59,212,.16)" : "transparent",
        color: "white",
        fontWeight: view === "profilo" ? 800 : 600,
        fontSize: 14,
      }}
    >
      <div style={{ fontSize: 18 }}>👤</div>
      <div style={{ fontSize: 11 }}>Profilo</div>
    </button>
  </div>
</div>
      </div>
    </main>
  );
}