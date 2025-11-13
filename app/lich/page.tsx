"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";

// Types
export type LichItem = {
  id: string;
  title: string;
  when: string; // raw text
  place?: string;
  note?: string;
  type?: string; // Ranking / Major / Junior / Blue Ribbon / Non-Ranking
  href?: string; // event page
  prize?: string;
  source?: "manual" | "matchroom";
  startISO?: string | null;
  endISO?: string | null;
};

type FilterMode = "all" | "upcoming" | "past";

const uid = () => Math.random().toString(36).slice(2);

export default function LichPage() {
  // Manual list (stored locally)
  const [list, setList] = useState<LichItem[]>([]);
  const [form, setForm] = useState<LichItem>({ id: "", title: "", when: "", place: "", note: "" });

  // Remote (Matchroom) list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remote, setRemote] = useState<LichItem[]>([]);

  // Filters
  const [mode, setMode] = useState<FilterMode>("upcoming");
  const [month, setMonth] = useState<number | "all">("all"); // 0-11 or 'all'

  // Init from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bia_lich");
      if (raw) setList(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("bia_lich", JSON.stringify(list));
    } catch {}
  }, [list]);

  const fetchMatchroom = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/matchroom", { cache: "no-store" });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Cannot load schedule");
      const items = parseMatchroomHTML(json.html);
      setRemote(items);
    } catch (e: any) {
      setError(e?.message || "Lỗi tải lịch từ Matchroom");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchroom();
  }, []);

  const submit = () => {
    if (!form.title || !form.when) return;
    const item: LichItem = { ...form, id: uid(), source: "manual" };
    setList([item, ...list]);
    setForm({ id: "", title: "", when: "", place: "", note: "" });
  };
  const remove = (id: string) => setList(list.filter((x) => x.id !== id));

  // Filtering & sorting
  const now = new Date();
  const filteredRemote = useMemo(() => {
    let items = [...remote];
    // Month filter first
    if (month !== "all") {
      items = items.filter(it => {
        const d = it.startISO ? new Date(it.startISO) : null;
        return d ? d.getMonth() === month : false;
      });
    }
    // Mode filter
    items = items.filter(it => {
      const start = it.startISO ? new Date(it.startISO) : null;
      if (!start) return mode === "all";
      if (mode === "upcoming") return start >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (mode === "past") return start < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return true;
    });
    // Sort by date asc
    items.sort((a,b) => {
      const da = a.startISO ? new Date(a.startISO).getTime() : Infinity;
      const db = b.startISO ? new Date(b.startISO).getTime() : Infinity;
      return da - db;
    });
    return items;
  }, [remote, mode, month]);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl p-4">
        <nav className="mb-2 text-sm flex items-center gap-2">
          <Link href="/" className="underline decoration-dotted hover:text-white">← Trang chủ</Link>
          <span className="opacity-50">/</span>
          <span className="text-slate-300">Lịch thi đấu</span>
        </nav>
        <header className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Lịch thi đấu — World Nineball Tour (Matchroom)</h1>
          <p className="text-sm text-slate-400 mt-1">Nguồn: matchroompool.com/schedule — đồng bộ đọc-only. Bạn vẫn có thể thêm lịch cá nhân bên dưới.</p>
          <Disclaimer />
        </header>

        {/* Remote schedule */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <h2 className="font-semibold">Lịch Matchroom</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex gap-1 rounded-xl border border-white/15 p-1 bg-white/5">
                {([["upcoming","Upcoming"],["all","All"],["past","Past"]] as const).map(([k,label]) => (
                  <button
                    key={k}
                    onClick={() => setMode(k as FilterMode)}
                    className={[
                      "px-3 py-1.5 rounded-lg",
                      mode===k ? "bg-white text-slate-900" : "hover:bg-white/10"
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <select
                className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-1.5"
                value={month === "all" ? "all" : String(month)}
                onChange={(e)=>{
                  const val = e.target.value;
                  setMonth(val==="all" ? "all" : parseInt(val,10));
                }}
                aria-label="Filter by month"
              >
                <option value="all">All months</option>
                {MONTHS.map((m,idx)=>(<option key={m} value={idx}>{m}</option>))}
              </select>
              <button onClick={fetchMatchroom} className="px-3 py-1.5 rounded-xl border border-white/20 disabled:opacity-60" disabled={loading}>
                {loading ? "Đang tải…" : "Tải lại"}
              </button>
              <Link href="https://matchroompool.com/schedule/" target="_blank" className="underline decoration-dotted hover:text-white">Mở trang gốc</Link>
            </div>
          </div>

          {error && (
            <div className="text-sm text-amber-300 mb-2">{error}</div>
          )}

          {filteredRemote.length === 0 && !loading ? (
            <p className="text-sm text-slate-400">Không có sự kiện phù hợp bộ lọc.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {filteredRemote.map((it) => (
                <li key={it.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wide text-slate-400">{it.type || "EVENT"}</div>
                      <h3 className="font-semibold text-white leading-snug">
                      {it.href ? (
  <a
    href={it.href}
    target="_blank"
    rel="noreferrer"
    className="hover:underline"
  >
    {it.title}  
  </a>
) : (
  it.title
)}

                      </h3>
                      <div className="text-sm text-slate-300">
                        {formatDateRange(it.startISO, it.endISO, it.when)}
                        {it.place ? <span> • {it.place}</span> : null}
                        {it.prize ? <span> • Prize: {it.prize}</span> : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs px-2 py-1 rounded-full border border-white/15 bg-white/10">Matchroom</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Manual add */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-4">
          <h2 className="font-semibold mb-3">Thêm lịch cá nhân</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Tiêu đề</label>
              <input className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Thời gian</label>
              <input type="datetime-local" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2" value={form.when} onChange={(e)=>setForm({...form,when:e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Địa điểm (tuỳ chọn)</label>
              <input className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2" value={form.place || ""} onChange={(e)=>setForm({...form,place:e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-slate-400">Ghi chú</label>
              <input className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2" value={form.note || ""} onChange={(e)=>setForm({...form,note:e.target.value})} />
            </div>
          </div>
          <div className="mt-3">
            <button onClick={submit} className="px-4 py-2 rounded-xl font-semibold bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-900">Lưu lịch</button>
          </div>
        </section>

        {/* Manual list */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-4">
          <h2 className="font-semibold mb-3">Danh sách (cá nhân)</h2>
          {list.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có lịch.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((it) => (
                <li key={it.id} className="rounded-xl border border-white/10 bg-slate-800 p-3 text-sm">
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-xs text-slate-400">{new Date(it.when).toLocaleString()} {it.place ? `• ${it.place}` : ""}</div>
                  {it.note ? <div className="mt-1">{it.note}</div> : null}
                  <div className="mt-2"><button onClick={()=>setList(list.filter(x=>x.id!==it.id))} className="text-xs text-red-300 underline">Xóa</button></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="text-xs text-slate-400 mt-6">© 2025 • Bi‑a Helper — Educational only.</footer>
      </div>
    </main>
  );
}

// --- Helpers ---
function monthNameToIndex(name: string): number | null {
  const map: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };
  const idx = map[name.toLowerCase()];
  return (idx === undefined ? null : idx);
}

function parseDateRangeToISO(text: string): { startISO: string | null, endISO: string | null } {
  // Examples that may appear:
  // "October 5-10 2025" or "October 5–10, 2025" or "Oct 5-10, 2025"
  // "October 28 - November 2, 2025" (cross-month)
  // We try to capture:
  // MonthA DayA [ -/– MonthB? DayB? ], Year
  const re = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:\s*[–-]\s*(?:(January|February|March|April|May|June|July|August|September|October|November|December)\s+)?(\d{1,2}))?\s*,?\s*(20\d{2})/i;
  const m = text.match(re);
  if (!m) return { startISO: null, endISO: null };
  const [, m1, d1s, m2maybe, d2s, years] = m;
  const y = parseInt(years, 10);
  const m1i = monthNameToIndex(m1)!;
  const d1 = parseInt(d1s, 10);
  const m2i = m2maybe ? monthNameToIndex(m2maybe)! : m1i;
  const d2 = d2s ? parseInt(d2s, 10) : d1;
  const start = new Date(Date.UTC(y, m1i, d1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m2i, d2, 23, 59, 59));
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

function parseMatchroomHTML(html: string): LichItem[] {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const anchors = Array.from(doc.querySelectorAll("a")) as HTMLAnchorElement[];

    const TYPES = ["Ranking", "Major", "Non-Ranking", "Junior", "Blue Ribbon"];

    const events: LichItem[] = [];
    for (const a of anchors) {
      const text = (a.textContent || "").replace(/\s+/g, " ").trim();
      if (!/\b20\d{2}\b/.test(text)) continue;
      if (!/(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(text)) continue;

      const href = a.href || "";
      if (!href.includes("matchroompool.com")) continue;
      if (!/\/events\//.test(href)) continue;

      const prizeMatch = text.match(/Prize Fund:\s*([$€£][\d,]+)/i);
      const prize = prizeMatch?.[1];
      const type = TYPES.find(t => text.includes(` ${t} `));

      const dateMatch = text.match(/^([A-Za-z]+\s[^]*?\b20\d{2}\b)/);
      const when = dateMatch?.[1]?.trim() || "";
      let rest = text.replace(dateMatch?.[0] || "", "").trim();
      if (type) rest = rest.replace(type, "").trim();
      if (prizeMatch) rest = rest.replace(prizeMatch[0], "").trim();

      let title = rest;
      let place: string | undefined;
      const idx = rest.lastIndexOf(", ");
      if (idx > 10) {
        title = rest.slice(0, idx).trim();
        place = rest.slice(idx + 2).trim();
      }

      const { startISO, endISO } = parseDateRangeToISO(when);

      events.push({
        id: href || text,
        title,
        when,
        place,
        prize,
        type,
        href,
        source: "matchroom",
        startISO,
        endISO
      });
    }

    // Deduplicate by href
    const seen = new Set<string>();
    const uniq = events.filter(e => (e.href ? !seen.has(e.href) && (seen.add(e.href), true) : true));

    // Sort by start date asc
    uniq.sort((a,b) => {
      const da = a.startISO ? new Date(a.startISO).getTime() : Infinity;
      const db = b.startISO ? new Date(b.startISO).getTime() : Infinity;
      return da - db;
    });

    return uniq;
  } catch (e) {
    console.error(e);
    return [];
  }
}

function formatDateRange(startISO?: string | null, endISO?: string | null, fallback?: string) {
  if (!startISO || !endISO) return fallback || "";
  const s = new Date(startISO);
  const e = new Date(endISO);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const sStr = s.toLocaleDateString(undefined, opts);
  const eStr = e.toLocaleDateString(undefined, opts);
  if (sStr === eStr) return sStr;
  return `${sStr} – ${eStr}`;
}
