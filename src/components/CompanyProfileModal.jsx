// CompanyProfileModal.jsx — Full-screen modal that displays a complete company intelligence profile.

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CompanyProfileView from "./CompanyProfileView";

export default function CompanyProfileModal({ companyName, summary, updatedAt, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative flex h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-stone-200 bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-stone-200 px-6 py-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">
              Company Intelligence Profile
            </p>
            <h2 className="mt-0.5 truncate text-lg font-bold text-stone-900">{companyName}</h2>
            {updatedAt && (
              <p className="text-[11px] text-stone-600">
                Generated {new Date(updatedAt).toLocaleString()}
              </p>
            )}
          </div>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="shrink-0 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-6">
            <CompanyProfileView markdown={summary} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
