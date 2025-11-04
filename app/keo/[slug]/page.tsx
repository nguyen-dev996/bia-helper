"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";
import HistoryList, { RoundItem } from "@/components/HistoryList";
import { getKeoBySlug, type Keo } from "@/lib/keodata";

type Player = { id: string; name: string };

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

export default function KeoDetailPage({ params }: { params: { slug: string } }) {
  const keo = useMemo<Keo | undefined>(() => getKeoBySlug(params.slug), [params.slug]);

  // STEP 1: players (max 5)
  const [players, setPlayers] = useLocalStorage<Player[]>(`players_${params.slug}`, []);

  // STEP 2: rounds history (live view below)
  const [history, setHistory] = useLocalStorage<RoundItem[]>(`hist_${params.slug}`, []);

  // UI step: only 1 or 2 now
  const [step, setStep] = useLocalStorage<number>(`ui_step_${params.slug}`, 1);

  // form for adding a round result
  const [winnerId, setWinnerId] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const nameRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    // ensure at least 2 inputs are visible initially
    if (players.length === 0) {
      setPlayers([
        { id: crypto.randomUUID(), name: "" },
        { id: crypto.randomUUID(), name: "" },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!keo) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 grid place-items-center">
        <div className="text-center">
          <p className="mb-4">Kèo không tồn tại.</p>
          <div className="flex items-center justify-center gap-3 text-sm">
            <Link href="/" className="underline decoration-dotted hover:text-white">← Trang chủ</Link>
            <span className="opacity-50">/</span>
            <Link href="/keo" className="underline decoration-dotted hover:text-white">Danh sách kèo</Link>
          </div>
        </div>
      </main>
    );
  }

  const canProceedStep1 = players.filter(p => p.name.trim()).length >= 2;

  const addPlayer = () => {
    if (players.length >= 5) return;
    const next = [...players, { id: crypto.randomUUID(), name: "" }];
    setPlayers(next);
    setTimeout(() => {
      const idx = next.length - 1;
      if (nameRefs.current[idx]) nameRefs.current[idx].focus();
    }, 0);
  };

  const removePlayer = (id: string) => {
    const next = players.filter(p => p.id !== id);
    setPlayers(next);
    if (winnerId === id) setWinnerId("");
  };

  const startMatch = () => {
    if (!canProceedStep1) return;
    setPlayers(players.map(p => ({ ...p, name: p.name.trim() })));
    setStep(2);
  };

  const resetAll = () => {
    setPlayers([]);
    setHistory([]);
    setWinnerId("");
    setNote("");
    setStep(1);
  };

  const submitRound = () => {
    if (!winnerId) return;
    const roundNo = history.length + 1;
    const item: RoundItem = {
      ts: Date.now(),
      round: roundNo,
      players: players.map(p => ({ id: p.id, name: p.name })),
      winnerId,
      note: note.trim() || undefined,
    };
    setHistory([item, ...history]); // newest first
    setWinnerId("");
    setNote("");
    // Automatically scroll to history section for immediate feedback
    const el = document.getElementById("history-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // running totals
  const tally = useMemo(() => {
    const map: Record<string, number> = {};
    players.forEach(p => { map[p.id] = 0; });
    history.forEach(h => {
      map[h.winnerId] = (map[h.winnerId] ?? 0) + 1;
    });
    return map;
  }, [history, players]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-4xl p-4">
        {/* Breadcrumbs with Home */}
        <nav className="mb-4 text-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="underline decoration-dotted hover:text-white">← Trang chủ</Link>
            <span className="opacity-50">/</span>
            <Link href="/keo" className="underline decoration-dotted hover:text-white">Danh sách kèo</Link>
            <span className="opacity-50">/</span>
            <span className="text-slate-300 truncate max-w-[40ch]">{keo.name}</span>
          </div>
        </nav>

        <header className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">{keo.name}</h1>
          <p className="text-slate-300 text-sm mt-1">{keo.summary}</p>
          <Disclaimer />
        </header>

        {/* STEP PROGRESS (only 1 & 2) */}
        <div className="flex items-center gap-3 mb-4 text-xs">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`px-2 py-1 rounded-full border ${
                step === s
                  ? "bg-emerald-400 text-slate-900 border-emerald-400"
                  : "border-white/20 text-slate-300"
              }`}
            >
              Bước {s}
            </div>
          ))}
          <button
            onClick={resetAll}
            className="ml-auto px-3 py-1.5 rounded-lg border border-white/20 text-xs"
          >
            Làm lại
          </button>
        </div>

        {/* STEP 1: nhập người tham gia */}
        {step === 1 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="font-semibold mb-3">
              Bước 1 — Nhập danh sách người tham gia (tối đa 5)
            </h2>
            <div className="space-y-2">
              {players.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2">
                  <input
                    ref={(el) => {
                      if (el) nameRefs.current[idx] = el;
                    }}
                    type="text"
                    placeholder={`Người chơi #${idx + 1}`}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                    value={p.name}
                    onChange={(e) => {
                      const next = [...players];
                      next[idx] = { ...p, name: e.target.value };
                      setPlayers(next);
                    }}
                  />
                  <button
                    className="px-2 py-2 rounded-xl border border-white/20 text-xs"
                    onClick={() => removePlayer(p.id)}
                    disabled={players.length <= 2}
                    title={
                      players.length <= 2
                        ? "Cần ít nhất 2 người chơi"
                        : "Xóa"
                    }
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={addPlayer}
                className="px-3 py-2 rounded-xl border border-white/20"
                disabled={players.length >= 5}
                title={
                  players.length >= 5
                    ? "Đã đạt tối đa 5 người"
                    : "Thêm người chơi"
                }
              >
                + Thêm người chơi
              </button>
              <button
                onClick={startMatch}
                className={`px-4 py-2 rounded-xl font-semibold ${
                  canProceedStep1
                    ? "bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-900"
                    : "border border-white/20 text-slate-300"
                }`}
                disabled={!canProceedStep1}
              >
                Bắt đầu (Bước 2)
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Yêu cầu tối thiểu 2 người chơi. Bạn có thể quay lại bước này bất cứ lúc nào bằng nút "Làm lại".
            </p>
          </section>
        )}

        {/* STEP 2: nhập kết quả sau mỗi ván + lịch sử ngay bên dưới */}
        {step === 2 && (
          <>
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="font-semibold mb-3">
                Bước 2 — Nhập kết quả ván #{history.length + 1}
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  {players.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 bg-slate-800/60 border border-white/10 rounded-xl px-3 py-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="winner"
                        className="accent-emerald-400"
                        value={p.id}
                        checked={winnerId === p.id}
                        onChange={() => setWinnerId(p.id)}
                      />
                      <span>{p.name || "(Chưa đặt tên)"}</span>
                      <span className="ml-auto text-xs text-slate-400">
                        Thắng: {tally[p.id] ?? 0}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="space-y-2">
                  <textarea
                    placeholder="Ghi chú (tuỳ chọn)"
                    className="w-full min-h-[88px] bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={submitRound}
                      disabled={!winnerId}
                      className={`px-4 py-2 rounded-xl font-semibold ${
                        winnerId
                          ? "bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-900"
                          : "border border-white/20 text-slate-300"
                      }`}
                    >
                      Lưu ván này
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Live history just below */}
            <section
              id="history-section"
              className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Lịch sử ván đấu</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistory([])}
                    className="px-3 py-2 rounded-xl border border-white/20"
                  >
                    Xóa lịch sử
                  </button>
                </div>
              </div>
              <HistoryList items={history} currentPlayers={players} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}