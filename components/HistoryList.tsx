import React, { useMemo } from "react";

export type RoundItem = {
  ts: number;              // timestamp
  round: number;           // round number (1-based)
  players: { id: string; name: string }[];
  winnerId: string;
  note?: string;
};

type Props = {
  items: RoundItem[];            // newest first
  currentPlayers?: { id: string; name: string }[]; // optional to show current order
};

export default function HistoryList({ items, currentPlayers }: Props) {
  const columns = useMemo(() => {
    // Prefer currentPlayers order; fallback to first item's players
    const base = currentPlayers && currentPlayers.length
      ? currentPlayers
      : (items[0]?.players ?? []);
    return base.map(p => ({ id: p.id, name: p.name || "(No name)" }));
  }, [items, currentPlayers]);

  const running = useMemo(() => {
    const map: Record<string, number> = {};
    columns.forEach(c => { map[c.id] = 0; });
    [...items].reverse().forEach(it => {
      map[it.winnerId] = (map[it.winnerId] ?? 0) + 1;
    });
    return map;
  }, [items, columns]);

  if (!items.length) {
    return <p className="text-slate-400 text-sm">Chưa có ván nào được lưu.</p>;
  }

  return (
    <div className="overflow-auto rounded-xl border border-white/10">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-800/60">
          <tr className="text-left">
            <th className="px-3 py-2 border-b border-white/10">Ván</th>
            {columns.map(col => (
              <th key={col.id} className="px-3 py-2 border-b border-white/10">{col.name}</th>
            ))}
            <th className="px-3 py-2 border-b border-white/10">Ghi chú</th>
          </tr>
          <tr className="text-left text-xs text-slate-300">
            <th className="px-3 py-2 border-b border-white/10">Tổng thắng</th>
            {columns.map(col => (
              <th key={col.id} className="px-3 py-2 border-b border-white/10">{running[col.id] ?? 0}</th>
            ))}
            <th className="px-3 py-2 border-b border-white/10">—</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.ts} className="odd:bg-white/5">
              <td className="px-3 py-2 border-b border-white/10">#{it.round}</td>
              {columns.map(col => {
                const isWinner = it.winnerId === col.id;
                return (
                  <td
                    key={col.id}
                    className={`px-3 py-2 border-b border-white/10 ${isWinner ? "bg-emerald-400 text-slate-900 font-semibold" : ""}`}
                  >
                    {isWinner ? "Thắng" : ""}
                  </td>
                );
              })}
              <td className="px-3 py-2 border-b border-white/10">{it.note ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
