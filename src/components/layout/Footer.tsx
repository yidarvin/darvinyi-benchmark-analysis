export function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <span className="font-mono font-bold text-cyan-500 text-sm">benchmark</span>
          <span className="font-mono text-zinc-600 text-sm">.darvinyi.com</span>
        </div>
        <p className="text-xs text-zinc-600">
          An independent exploration of LLM benchmarks and agentic AI evaluations.
          Scores are sourced from public leaderboards and research papers.
        </p>
      </div>
    </footer>
  );
}
