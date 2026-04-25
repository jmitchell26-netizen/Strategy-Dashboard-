import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";

export default function SearchBar({ query, onChange }) {
  return (
    // "search-glow" adds a blurred colored halo behind the input when focused (defined in index.css)
    <div className="search-glow relative">

      {/* Magnifying glass icon — positioned absolutely inside the left side of the input */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
        <svg
          className="h-5 w-5 text-stone-500 transition-colors"
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

      <Input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search company name (e.g. Apple, Tesla, Microsoft)…"
        className="w-full rounded border border-stone-200 bg-white py-4 pl-14 pr-5 h-auto text-[15px] font-medium text-stone-800 placeholder:text-stone-300 shadow-sm transition-all focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-200"
      />

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
        <Kbd className="hidden text-slate-500 sm:inline-flex">⌘ K</Kbd>
      </div>
    </div>
  );
}
