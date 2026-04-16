// ProfileCompareModal.jsx — Full-screen view of two AI-generated company profiles side by side,
// plus an optional AI synthesis comparing them.
import MarkdownContent from "./MarkdownContent";

export default function ProfileCompareModal({
  companyA,
  companyB,
  profileA,
  profileB,
  synthesis,
  loadingSynthesis,
  onClose,
  onRequestSynthesis,
}) {
  return (
    <div className="animate-fade-in fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        className="animate-slide-up relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c18]/95 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-white/[0.06] px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Compare company profiles</h2>
              <p className="text-[12px] font-medium text-slate-500">
                AI-generated summaries from your tagged articles
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Optional comparison synthesis */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRequestSynthesis}
              disabled={loadingSynthesis}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSynthesis ? "Generating…" : "AI comparison summary"}
            </button>
            {synthesis && (
              <span className="text-[11px] text-slate-500">Uses one extra OpenAI call</span>
            )}
          </div>
          {synthesis && (
            <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
              <MarkdownContent>{synthesis}</MarkdownContent>
            </div>
          )}
        </div>

        <div className="grid max-h-[min(70vh,720px)] gap-0 overflow-y-auto sm:grid-cols-2">
          <div className="border-b border-white/[0.06] p-6 sm:border-b-0 sm:border-r sm:border-white/[0.06] sm:p-8">
            <h3 className="mb-3 text-sm font-bold text-violet-300">{companyA}</h3>
            <MarkdownContent>{profileA}</MarkdownContent>
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="mb-3 text-sm font-bold text-violet-300">{companyB}</h3>
            <MarkdownContent>{profileB}</MarkdownContent>
          </div>
        </div>
      </div>
    </div>
  );
}
