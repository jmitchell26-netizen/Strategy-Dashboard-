// ProfileCompareModal.jsx — Full-screen view of two AI-generated company profiles side by side,
// plus an optional AI synthesis comparing them.
import MarkdownContent from "./MarkdownContent";
import CompanyProfileView from "./CompanyProfileView";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              size="icon-sm"
              className="shrink-0 border-white/[0.06] bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Optional comparison synthesis */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={onRequestSynthesis}
              disabled={loadingSynthesis}
              variant="outline"
              size="sm"
              className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100"
            >
              {loadingSynthesis ? <><Spinner className="mr-1.5 h-3 w-3" />Generating…</> : "AI comparison summary"}
            </Button>
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

        <div className="grid gap-0 sm:grid-cols-2">
          <div className="max-h-[70vh] overflow-y-auto border-b border-white/[0.06] p-4 sm:border-b-0 sm:border-r sm:border-white/[0.06] sm:p-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">{companyA}</p>
            <CompanyProfileView markdown={profileA} />
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">{companyB}</p>
            <CompanyProfileView markdown={profileB} />
          </div>
        </div>
      </div>
    </div>
  );
}
