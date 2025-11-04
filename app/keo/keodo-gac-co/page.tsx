"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Progression = "cấp số cộng" | "cấp số nhân";

type Round = {
  winnerIndex: number;
};

export default function GacCoPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);

  // Config
  const [baseStake, setBaseStake] = useState<number | "">("");
  const [progression, setProgression] = useState<Progression>("cấp số cộng");
  const [stepValue, setStepValue] = useState<number | "">(""); // chỉ dùng cho cộng
  const [multiplier, setMultiplier] = useState<number | "">(""); // chỉ dùng cho nhân
  const [streakCap, setStreakCap] = useState<number | "">(""); // 0 = không giới hạn

  const [currentWinner, setCurrentWinner] = useState<number | "">("");

  const canGoStep2 = players.length >= 2 && players.length <= 5;
  const canGoStep3 =
    typeof baseStake === "number" &&
    baseStake >= 0 &&
    (progression === "cấp số cộng"
      ? typeof stepValue === "number" && stepValue >= 0
      : typeof multiplier === "number" && multiplier >= 1);

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
    setBaseStake("");
    setProgression("cấp số cộng");
    setStepValue("");
    setMultiplier("");
    setStreakCap("");
    setCurrentWinner("");
  };

  // Tính streak & số tiền từng ván (amountPerLoser) theo cấu hình
  const perRoundCalc = useMemo(() => {
    const N = players.length;
    const b = typeof baseStake === "number" ? baseStake : 0;
    const addStep = typeof stepValue === "number" ? stepValue : 0;
    const mul = typeof multiplier === "number" ? multiplier : 1;
    const cap = typeof streakCap === "number" ? streakCap : 0;

    // streak[i]: chuỗi thắng hiện tại trước khi xử lý ván j
    const streak = Array(N).fill(0);
    // Kết quả từng ván
    const detail = rounds.map((r) => {
      // tăng streak winner
      streak[r.winnerIndex] += 1;
      // cap nếu có
      if (cap > 0 && streak[r.winnerIndex] > cap) streak[r.winnerIndex] = cap;

      const s = streak[r.winnerIndex];
      // amount per loser
      let amountPerLoser = 0;
      if (progression === "cấp số cộng") {
        amountPerLoser = b + (s - 1) * addStep;
      } else {
        amountPerLoser = Math.round(b * Math.pow(mul, s - 1));
      }

      // thua thì reset streak về 0
      for (let i = 0; i < N; i++) {
        if (i !== r.winnerIndex) streak[i] = 0;
      }

      return {
        winnerIndex: r.winnerIndex,
        streak: s, // streak sau khi thắng ván này
        amountPerLoser,
        totalWinnerGain: amountPerLoser * (N - 1),
      };
    });

    return detail;
  }, [rounds, players.length, baseStake, stepValue, multiplier, streakCap, progression]);

  // Tổng tiền mỗi người
  const totals = useMemo(() => {
    const N = players.length;
    const arr = Array(N).fill(0);
    perRoundCalc.forEach((d) => {
      const w = d.winnerIndex;
      arr[w] += d.amountPerLoser * (N - 1);
      for (let i = 0; i < N; i++) {
        if (i !== w) arr[i] -= d.amountPerLoser;
      }
    });
    return arr;
  }, [perRoundCalc, players.length]);

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
            <h1 className="text-2xl md:text-3xl font-bold">Kèo Độ — Gác cơ (thắng giữ cơ)</h1>
            <p className="text-sm text-slate-400">
              B1: người chơi (≤5) • B2: cấu hình tiền/chuỗi • B3: chọn người thắng từng ván. Tiền 1 ván tăng theo chuỗi thắng.
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
            <h2 className="text-lg font-semibold">Bước 2: Cấu hình tiền/chuỗi</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Tiền nền (VND/ván)</label>
                <input
                  type="number"
                  min={0}
                  value={baseStake}
                  onChange={(e) => setBaseStake(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="VD: 10000"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Kiểu tăng tiền</label>
                <select
                  value={progression}
                  onChange={(e) => setProgression(e.target.value as Progression)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option>cấp số cộng</option>
                  <option>cấp số nhân</option>
                </select>
              </div>

              {progression === "cấp số cộng" ? (
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Bước tăng (+VND/ván)</label>
                  <input
                    type="number"
                    min={0}
                    value={stepValue}
                    onChange={(e) => setStepValue(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="VD: 10000"
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Hệ số nhân</label>
                  <input
                    type="number"
                    min={1}
                    value={multiplier}
                    onChange={(e) => setMultiplier(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="VD: 2"
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Giới hạn chuỗi (0 = không giới hạn)</label>
                <input
                  type="number"
                  min={0}
                  value={streakCap}
                  onChange={(e) => setStreakCap(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="VD: 0"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>

            {!canGoStep3 && (
              <div className="text-xs text-amber-300">
                Vui lòng nhập Tiền nền và tham số tăng tiền hợp lệ.
              </div>
            )}

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
            <h2 className="text-lg font-semibold">Bước 3: Ghi ván (ai thắng giữ cơ)</h2>
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
              {rounds.map((r, idx) => {
                const d = perRoundCalc[idx];
                return (
                  <div key={idx} className="rounded-xl border border-white/10 bg-slate-800/40 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">
                        Ván {idx + 1}: Winner{" "}
                        <span className="text-emerald-300">{players[r.winnerIndex]}</span> — chuỗi thắng{" "}
                        <strong>{d.streak}</strong>,{" "}
                        <span className="text-emerald-200">+{d.amountPerLoser.toLocaleString()} đ</span> mỗi người thua
                        (winner nhận tổng {d.totalWinnerGain.toLocaleString()} đ)
                      </div>
                      <button
                        onClick={() => removeRound(idx)}
                        className="px-2 py-1 rounded-md text-xs bg-red-500/15 text-red-200 hover:bg-red-500/25"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}

              {rounds.length === 0 && (
                <div className="px-3 py-4 text-slate-400 border border-white/10 rounded-xl bg-slate-800/40">
                  Chưa có ván nào. Hãy chọn người thắng rồi bấm “Thêm ván”.
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
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
