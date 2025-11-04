"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Round = { winnerIndex: number };

export default function TimeBetPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);

  // Config thời gian & phí bàn
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [durationMin, setDurationMin] = useState<number | "">("");

  // Stake per-rack (tuỳ chọn). Nếu = 0 hoặc rỗng: chỉ chia phí bàn, không tính độ theo ván
  const [stakePerRack, setStakePerRack] = useState<number | "">("");

  const [currentWinner, setCurrentWinner] = useState<number | "">("");

  const canGoStep2 = players.length >= 2 && players.length <= 5;
  const canGoStep3 =
    typeof hourlyRate === "number" &&
    hourlyRate >= 0 &&
    typeof durationMin === "number" &&
    durationMin >= 0 &&
    (stakePerRack === "" || (typeof stakePerRack === "number" && stakePerRack >= 0));

  const handleBuildPlayers = () => {
    const unique = Array.from(
      new Set(
        playerInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    ).slice(0, 5);
    setPlayers(unique);
    setRounds([]);
    setCurrentWinner("");
    setStep(2);
  };

  const resetAll = () => {
    setStep(1);
    setPlayerInput("");
    setPlayers([]);
    setRounds([]);
    setHourlyRate("");
    setDurationMin("");
    setStakePerRack("");
    setCurrentWinner("");
  };

  const N = players.length;
  const fee = useMemo(() => {
    const h = typeof hourlyRate === "number" ? hourlyRate : 0;
    const m = typeof durationMin === "number" ? durationMin : 0;
    return (h * (m / 60)) || 0;
  }, [hourlyRate, durationMin]);

  const feePerPlayer = useMemo(() => {
    if (N <= 0) return 0;
    return fee / N;
  }, [fee, N]);

  // Tính độ theo ván (nếu stakePerRack > 0): mỗi ván winner nhận stake*(N-1), mỗi loser trả stake
  const perRackTotals = useMemo(() => {
    const stake = typeof stakePerRack === "number" ? stakePerRack : 0;
    const arr = Array(N).fill(0);
    if (stake <= 0 || N <= 1) return arr;

    for (const r of rounds) {
      const w = r.winnerIndex;
      arr[w] += stake * (N - 1);
      for (let i = 0; i < N; i++) {
        if (i !== w) arr[i] -= stake;
      }
    }
    return arr;
  }, [rounds, stakePerRack, N]);

  // Tổng cuối = độ theo ván ± phí bàn chia đều (phí bàn trừ đều)
  const totals = useMemo(() => {
    const arr = perRackTotals.map((v) => v - feePerPlayer);
    return arr;
  }, [perRackTotals, feePerPlayer]);

  const addRound = () => {
    if (typeof currentWinner !== "number") {
      alert("Hãy chọn người thắng ván này.");
      return;
    }
    setRounds((prev) => [...prev, { winnerIndex: currentWinner }]);
    setCurrentWinner("");
  };

  const removeRound = (idx: number) => setRounds((prev) => prev.filter((_, i) => i !== idx));

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl p-4">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Kèo Độ — Theo thời gian (công tơ/giờ chơi)</h1>
            <p className="text-sm text-slate-400">
              B1: người chơi (≤5) • B2: nhập đơn giá/giờ & thời lượng • B3: (tuỳ chọn) ghi winner từng ván để tính độ.
              Cuối buổi: tổng = độ theo ván − phí bàn chia đều.
            </p>
          </div>
          <Link href="/keo" className="text-sm text-slate-300 underline decoration-dotted hover:text-white">
            ← Danh sách kèo
          </Link>
        </header>

        {/* Steps */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={[
                "px-3 py-1.5 rounded-full text-xs border",
                step === s ? "bg-white text-slate-900 border-white" : "bg-slate-800/60 text-slate-200 border-white/10",
              ].join(" ")}
            >
              Bước {s}
            </div>
          ))}
          <button
            className="ml-auto px-3 py-1.5 rounded-full text-xs border bg-red-500/10 text-red-200 border-red-500/30 hover:bg-red-500/20"
            onClick={resetAll}
          >
            Làm lại
          </button>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Bước 1: Nhập tên người chơi (tối đa 5)</h2>
            <input
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder="Ví dụ: A, B, C"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
            />
            <div className="flex items-center gap-2">
              <button onClick={handleBuildPlayers} className="px-3 py-2 rounded-xl text-sm bg-white text-slate-900 hover:opacity-90">
                Xác nhận người chơi
              </button>
              <span className="text-xs text-slate-400">Nhập tên cách nhau bằng dấu phẩy</span>
            </div>
            {players.length > 0 && (
              <div className="text-sm text-slate-300">
                Đã chọn: {players.map((p, i) => (
                  <span key={p} className="mr-2">
                    {i + 1}. {p}
                  </span>
                ))}
              </div>
            )}
            {!canGoStep2 && players.length > 0 && (
              <div className="text-xs text-amber-300">Cần từ 2–5 người chơi. Hiện có {players.length}.</div>
            )}
            <div className="pt-2">
              <button
                disabled={!canGoStep2}
                onClick={() => setStep(2)}
                className={[
                  "px-3 py-2 rounded-xl text-sm",
                  canGoStep2 ? "bg-cyan-400 text-slate-900 hover:opacity-90" : "bg-slate-700 text-slate-400 cursor-not-allowed",
                ].join(" ")}
              >
                Tiếp tục → Bước 2
              </button>
            </div>
          </section>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <h2 className="text-lg font-semibold">Bước 2: Phí bàn & thời lượng</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Đơn giá giờ bàn (VND/giờ)</label>
                <input
                  type="number"
                  min={0}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="VD: 120000"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Thời lượng buổi (phút)</label>
                <input
                  type="number"
                  min={0}
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="VD: 90"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Stake per-rack (tuỳ chọn)</label>
                <input
                  type="number"
                  min={0}
                  value={stakePerRack}
                  onChange={(e) => setStakePerRack(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="VD: 5000 (để 0 nếu chỉ chia phí bàn)"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>

            {!canGoStep3 && (
              <div className="text-xs text-amber-300">
                Vui lòng nhập đơn giá/giờ và thời lượng hợp lệ.
              </div>
            )}

            <div className="rounded-lg bg-slate-800/40 border border-white/10 px-3 py-2 text-sm">
              <div>Phí bàn dự kiến: <strong>{fee.toLocaleString()} đ</strong></div>
              <div>Chia đều {N || 0} người: <strong>{feePerPlayer.toLocaleString()} đ/người</strong></div>
            </div>

            <div>
              <button
                disabled={!canGoStep3}
                onClick={() => setStep(3)}
                className={[
                  "px-3 py-2 rounded-xl text-sm",
                  canGoStep3 ? "bg-cyan-400 text-slate-900 hover:opacity-90" : "bg-slate-700 text-slate-400 cursor-not-allowed",
                ].join(" ")}
              >
                Tiếp tục → Bước 3
              </button>
            </div>
          </section>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <h2 className="text-lg font-semibold">Bước 3: (Tuỳ chọn) ghi winner từng ván</h2>
            <p className="text-sm text-slate-400">
              Nếu <strong>Stake per-rack = 0</strong>: bỏ qua phần ghi ván, hệ thống chỉ chia phí bàn.
              <br />
              Nếu đặt Stake per-rack &gt; 0: mỗi ván winner nhận <code>stake × (N-1)</code>, mỗi loser trả <code>stake</code>.
            </p>

            <div className="flex items-center gap-2">
              <select
                value={currentWinner === "" ? "" : String(currentWinner)}
                onChange={(e) => setCurrentWinner(e.target.value === "" ? "" : Number(e.target.value))}
                className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="">— Chọn người thắng ván —</option>
                {players.map((p, i) => (
                  <option key={p} value={i}>
                    {p}
                  </option>
                ))}
              </select>
              <button onClick={addRound} className="px-3 py-2 rounded-xl text-sm bg-white text-slate-900 hover:opacity-90">
                Thêm ván
              </button>
            </div>

            {/* Lịch sử ván */}
            <div className="space-y-3">
              {rounds.map((r, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-slate-800/40 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">
                      Ván {idx + 1}: Winner <span className="text-emerald-300">{players[r.winnerIndex]}</span>{" "}
                      {typeof stakePerRack === "number" && stakePerRack > 0 ? (
                        <>
                          — +{(stakePerRack * (N - 1)).toLocaleString()} đ (mỗi người thua −
                          {stakePerRack.toLocaleString()} đ)
                        </>
                      ) : (
                        <span className="text-slate-400">(ghi nhận thắng thua, không tính tiền ván)</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeRound(idx)}
                      className="px-2 py-1 rounded-md text-xs bg-red-500/15 text-red-200 hover:bg-red-500/25"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
              {rounds.length === 0 && (
                <div className="px-3 py-4 text-slate-400 border border-white/10 rounded-xl bg-slate-800/40">
                  Chưa có ván nào. Bạn có thể bỏ qua phần này nếu chỉ muốn chia phí bàn.
                </div>
              )}
            </div>

            {/* Tổng kết */}
            <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3">
              <h3 className="font-semibold mb-2">Tổng kết</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {players.map((p, i) => (
                  <div
                    key={p}
                    className={[
                      "flex items-center justify-between px-3 py-2 rounded-lg border",
                      totals[i] > 0
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                        : totals[i] < 0
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                        : "bg-slate-700/30 border-white/10 text-slate-200",
                    ].join(" ")}
                  >
                    <span>{p}</span>
                    <span>{totals[i].toLocaleString()} đ</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-400 mt-2">
                Phí bàn: {fee.toLocaleString()} đ • Mỗi người chịu: {feePerPlayer.toLocaleString()} đ
                {typeof stakePerRack === "number" && stakePerRack > 0
                  ? ` • Stake/ván: ${stakePerRack.toLocaleString()} đ`
                  : " • Không tính tiền theo ván"}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
