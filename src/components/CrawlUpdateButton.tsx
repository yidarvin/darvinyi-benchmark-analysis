"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatCountdown, formatRelative } from "@/lib/relative-time";

type CrawlPhase = "idle" | "running" | "success" | "failed";

interface CrawlRunSummary {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: "running" | "success" | "failed";
  candidates_found: number;
  added: number;
  skipped_duplicates: number;
  error: string | null;
}

interface StatusResponse {
  status: CrawlPhase;
  last_completed_at: string | null;
  last_started_at: string | null;
  current_run_id: string | null;
  cooldown_seconds_remaining: number;
  can_trigger: boolean;
  most_recent_run: CrawlRunSummary | null;
}

type UIState =
  | { kind: "loading" }
  | { kind: "idle"; lastCompletedAt: string | null }
  | { kind: "cooldown"; cooldownSeconds: number; lastCompletedAt: string | null }
  | { kind: "running"; startedAt: string | null }
  | { kind: "success"; added: number; candidates: number; skipped: number }
  | { kind: "error"; message: string };

const POLL_INTERVAL_MS = 5_000;
const COUNTDOWN_TICK_MS = 60_000;
const SUCCESS_DISPLAY_MS = 8_000;

function deriveState(status: StatusResponse): UIState {
  if (status.status === "running") {
    return { kind: "running", startedAt: status.last_started_at };
  }
  if (status.cooldown_seconds_remaining > 0) {
    return {
      kind: "cooldown",
      cooldownSeconds: status.cooldown_seconds_remaining,
      lastCompletedAt: status.last_completed_at,
    };
  }
  return { kind: "idle", lastCompletedAt: status.last_completed_at };
}

interface CrawlUpdateButtonProps {
  onComplete?: () => void;
  // API base for status/trigger endpoints. Defaults to the benchmark crawl;
  // the agents page passes "/api/agent-crawl" to drive the parallel crawl.
  apiBase?: string;
  // Override the button labels and result subtext. Defaults read as
  // "Check for new benchmarks" / "Added N new benchmarks." which is wrong
  // for the agent-crawl mount.
  labels?: {
    idle?: string;
    running?: string;
    noun?: string;        // singular noun used in the success subtext
    nounPlural?: string;  // plural noun used in the success subtext
  };
}

const DEFAULT_LABELS = {
  idle: "Check for new benchmarks",
  running: "Searching for new benchmarks…",
  noun: "benchmark",
  nounPlural: "benchmarks",
} as const;

export function CrawlUpdateButton({
  onComplete,
  apiBase = "/api/crawl",
  labels: labelOverrides,
}: CrawlUpdateButtonProps = {}) {
  const router = useRouter();
  const [state, setState] = useState<UIState>({ kind: "loading" });
  const labels = { ...DEFAULT_LABELS, ...(labelOverrides ?? {}) };
  const statusUrl = `${apiBase}/status`;
  const triggerUrl = `${apiBase}/trigger`;

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPoll = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const clearTick = useCallback(() => {
    if (tickTimer.current) {
      clearInterval(tickTimer.current);
      tickTimer.current = null;
    }
  }, []);

  const fetchStatus = useCallback(async (): Promise<StatusResponse | null> => {
    try {
      const res = await fetch(statusUrl, { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as StatusResponse;
    } catch {
      return null;
    }
  }, [statusUrl]);

  const refreshFromServer = useCallback(async () => {
    const status = await fetchStatus();
    if (!status) {
      setState({ kind: "error", message: "Could not load crawl status." });
      return null;
    }
    setState(deriveState(status));
    return status;
  }, [fetchStatus]);

  // Initial mount: load status.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const status = await fetchStatus();
      if (cancelled) return;
      if (!status) {
        setState({ kind: "error", message: "Could not load crawl status." });
        return;
      }
      setState(deriveState(status));
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchStatus]);

  // While running: poll every 5s.
  useEffect(() => {
    if (state.kind !== "running") {
      clearPoll();
      return;
    }
    if (pollTimer.current) return;

    pollTimer.current = setInterval(async () => {
      const status = await fetchStatus();
      if (!status) return;

      if (status.status === "running") {
        // Refresh startedAt in case the timestamp shifted.
        setState({ kind: "running", startedAt: status.last_started_at });
        return;
      }

      if (status.status === "success" && status.most_recent_run) {
        const run = status.most_recent_run;
        setState({
          kind: "success",
          added: run.added,
          candidates: run.candidates_found,
          skipped: run.skipped_duplicates,
        });
        // Server components / page data refresh.
        router.refresh();
        onComplete?.();
        if (successTimer.current) clearTimeout(successTimer.current);
        successTimer.current = setTimeout(() => {
          void refreshFromServer();
        }, SUCCESS_DISPLAY_MS);
        return;
      }

      // failed
      const message = status.most_recent_run?.error ?? "Crawl failed.";
      setState({ kind: "error", message });
    }, POLL_INTERVAL_MS);

    return clearPoll;
  }, [state.kind, fetchStatus, router, onComplete, refreshFromServer, clearPoll]);

  // While cooling down: decrement countdown each minute.
  useEffect(() => {
    if (state.kind !== "cooldown") {
      clearTick();
      return;
    }
    if (tickTimer.current) return;

    tickTimer.current = setInterval(() => {
      setState((prev) => {
        if (prev.kind !== "cooldown") return prev;
        const next = prev.cooldownSeconds - 60;
        if (next <= 0) {
          return { kind: "idle", lastCompletedAt: prev.lastCompletedAt };
        }
        return { ...prev, cooldownSeconds: next };
      });
    }, COUNTDOWN_TICK_MS);

    return clearTick;
  }, [state.kind, clearTick]);

  // Final cleanup.
  useEffect(() => {
    return () => {
      clearPoll();
      clearTick();
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, [clearPoll, clearTick]);

  const handleClick = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const res = await fetch(triggerUrl, { method: "POST" });

      if (res.status === 202) {
        // Re-fetch authoritative state instead of trusting our local guess.
        const status = await fetchStatus();
        setState(
          status
            ? deriveState(status)
            : { kind: "running", startedAt: new Date().toISOString() },
        );
        return;
      }

      if (res.status === 429) {
        const body = (await res.json().catch(() => ({}))) as {
          retry_after_seconds?: number;
          last_completed_at?: string;
        };
        setState({
          kind: "cooldown",
          cooldownSeconds: body.retry_after_seconds ?? 0,
          lastCompletedAt: body.last_completed_at ?? null,
        });
        return;
      }

      if (res.status === 409) {
        await refreshFromServer();
        return;
      }

      setState({
        kind: "error",
        message: `Trigger failed (HTTP ${res.status}).`,
      });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Network error.",
      });
    }
  }, [fetchStatus, refreshFromServer, triggerUrl]);

  const interactive = state.kind === "idle" || state.kind === "error";
  const isRunning = state.kind === "running";

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={!interactive}
        aria-disabled={!interactive}
        aria-busy={isRunning}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2",
          "text-xs font-medium transition-all duration-200",
          interactive
            ? "bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 hover:border-zinc-600 cursor-pointer"
            : "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed",
        )}
      >
        {isRunning && <Spinner />}
        <span>{primaryLabel(state, labels)}</span>
      </button>

      <p
        aria-live="polite"
        className={cn(
          "min-h-[1rem] text-[11px] text-zinc-500 text-right",
          "transition-opacity duration-200",
        )}
      >
        {subtext(state, labels)}
      </p>
    </div>
  );
}

interface ResolvedLabels {
  idle: string;
  running: string;
  noun: string;
  nounPlural: string;
}

function Spinner() {
  return (
    <span role="status" className="inline-flex items-center">
      <svg
        className="h-3.5 w-3.5 animate-spin text-zinc-400"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="3"
        />
        <path
          d="M22 12a10 10 0 0 1-10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">Crawl in progress</span>
    </span>
  );
}

function primaryLabel(state: UIState, labels: ResolvedLabels): string {
  switch (state.kind) {
    case "loading":
      return "Loading…";
    case "idle":
      return labels.idle;
    case "cooldown":
      return `Available in ${formatCountdown(state.cooldownSeconds)}`;
    case "running":
      return labels.running;
    case "success":
      return labels.idle;
    case "error":
      return "Retry";
  }
}

function subtext(state: UIState, labels: ResolvedLabels): React.ReactNode {
  switch (state.kind) {
    case "loading":
      return " ";
    case "idle":
      return state.lastCompletedAt
        ? `Last updated ${formatRelative(new Date(state.lastCompletedAt))}`
        : "Never updated";
    case "cooldown":
      return state.lastCompletedAt
        ? `Last updated ${formatRelative(new Date(state.lastCompletedAt))}`
        : "Cooling down";
    case "running":
      return state.startedAt
        ? `Started ${formatRelative(new Date(state.startedAt))}`
        : "Just started";
    case "success": {
      const { added, candidates, skipped } = state;
      const head =
        added === 0
          ? `No new ${labels.nounPlural} found.`
          : `Added ${added} new ${added === 1 ? labels.noun : labels.nounPlural}.`;
      const tail = `Found ${candidates} candidate${
        candidates === 1 ? "" : "s"
      }, skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}.`;
      return <span className="text-emerald-400">{`${head} ${tail}`}</span>;
    }
    case "error":
      return <span className="text-red-400">{state.message}</span>;
  }
}
