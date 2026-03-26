export default function StrategyMatrix({ items, onRemove }) {
  if (items.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01] py-20 text-center backdrop-blur-sm">
        <div className="animate-glow-pulse pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-blue-500/[0.03]" />
        <div className="relative">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <svg
              className="h-7 w-7 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Your matrix is empty
          </p>
          <p className="mt-1.5 text-xs text-slate-600">
            Save news items to build your strategy overview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.03]">
            <th className="px-5 py-3.5 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
              Title
            </th>
            <th className="hidden px-5 py-3.5 text-[11px] font-bold tracking-widest text-slate-500 uppercase lg:table-cell">
              Category
            </th>
            <th className="hidden px-5 py-3.5 text-[11px] font-bold tracking-widest text-slate-500 uppercase md:table-cell">
              Source
            </th>
            <th className="px-5 py-3.5 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
              Date
            </th>
            <th className="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              className="animate-fade-in group border-b border-white/[0.03] transition-colors last:border-0 hover:bg-white/[0.03]"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <td className="max-w-[220px] truncate px-5 py-3.5 text-[13px] font-semibold text-slate-200">
                {item.title}
              </td>
              <td className="hidden px-5 py-3.5 text-[13px] text-slate-500 lg:table-cell">
                {item.category}
              </td>
              <td className="hidden px-5 py-3.5 text-[13px] text-slate-500 md:table-cell">
                {item.source}
              </td>
              <td className="px-5 py-3.5 text-[13px] tabular-nums text-slate-600">
                {item.date}
              </td>
              <td className="px-5 py-3.5 text-right">
                <button
                  onClick={() => onRemove(item.id)}
                  className="cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-wide text-red-400/70 uppercase transition-all hover:bg-red-500/10 hover:text-red-400"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
