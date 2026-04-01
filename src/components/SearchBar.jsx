// SearchBar.jsx — The search input at the top of the dashboard.
// Accepts the current query string and an onChange callback from the parent.
// Features a magnifying glass icon, a glowing focus effect (via the "search-glow"
// CSS class in index.css), and a decorative keyboard shortcut badge.

export default function SearchBar({ query, onChange }) {
  return (
    // "search-glow" adds a blurred colored halo behind the input when focused (defined in index.css)
    <div className="search-glow relative">

      {/* Magnifying glass icon — positioned absolutely inside the left side of the input */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
        <svg
          className="h-5 w-5 text-slate-500 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>

      {/* The actual text input — controlled component bound to query/onChange props */}
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search company name (e.g. Apple, Tesla, Microsoft)…"
        className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] py-4 pl-14 pr-5 text-[15px] font-medium text-white placeholder-slate-600 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 focus:border-violet-500/40 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-violet-500/20"
      />

      {/* Decorative keyboard shortcut hint (purely visual, not functional) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
        <kbd className="hidden rounded-lg border border-slate-700/50 bg-slate-800/60 px-2 py-0.5 font-sans text-[11px] font-medium text-slate-500 sm:inline-block">
          ⌘ K
        </kbd>
      </div>
    </div>
  );
}
