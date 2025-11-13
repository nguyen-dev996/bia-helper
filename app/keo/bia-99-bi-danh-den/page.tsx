"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Round = {
  /** values[i]: nếu là winnerIndex -> tổng bi nhận, còn lại là bi đền đã nhập */
  values: number[];
  winnerIndex: number;
  totalLoserBalls: number;
};

export default function Bia99BiDanhDenPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [unit, setUnit] = useState<number | "">("");
  const [rounds, setRounds] = useState<Round[]>([]);

  /** Input cho từng ván: mảng độ dài N; để trống đúng 1 người (winner) */
  const [currentInputsSingle, setCurrentInputsSingle] = useState<(number | "")[]>([]);

  const canGoStep2 = players.length >= 2 && players.length <= 5;
  const canGoStep3 = typeof unit === "number" && unit > 0;

  const handleBuildPlayers = () => {
    const list = playerInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const unique: string[] = [];
    for (const name of list) {
      if (!unique.includes(name)) unique.push(name);
      if (unique.length === 5) break;
    }
    setPlayers(unique);
    setCurrentInputsSingle(Array(unique.length).fill(""));
    setStep(2);
  };

  const resetAll = () => {
    setStep(1);
    setPlayerInput("");
    setPlayers([]);
    setUnit("");
    setRounds([]);
    setCurrentInputsSingle([]);
  };

  /** Net bi theo ván (không nhân unit) để hiển thị */
  const ballsNetByRound = (r: Round, playerCount: number) => {
    const net: number[] = Array(playerCount).fill(0);
    r.values.forEach((v, i) => {
      if (i === r.winnerIndex) net[i] += v;
      else net[i] -= v;
    });
    return net;
  };

  /** Tổng bi (net) của từng người qua tất cả các ván */
  const ballsTotals = useMemo(() => {
    const arr: number[] = Array(players.length).fill(0);
    for (const r of rounds) {
      const net = ballsNetByRound(r, players.length);
      for (let i = 0; i < players.length; i++) {
        arr[i] += net[i];
      }
    }
    return arr;
  }, [rounds, players.length]);

  /** Tổng tiền của từng người từ tất cả các ván, nhân với unit */
  const moneyTotals = useMemo(() => {
    const arr: number[] = Array(players.length).fill(0);
    const u = typeof unit === "number" ? unit : 0;

    for (const r of rounds) {
      r.values.forEach((v, i) => {
        if (i === r.winnerIndex) arr[i] += v * u; // winner cộng
        else arr[i] -= v * u; // loser trừ
      });
    }
    return arr;
  }, [rounds, players.length, unit]);

  /** Thêm ván theo rule: 1 winner ăn hết, tổng bi đền của losers = 99 */
  const addRound = () => {
    if (!players.length) return;

    // chuẩn hoá input: "" -> blank (để xác định winner), còn lại Number >= 0
    const balls: (number | "")[] = currentInputsSingle.map((v) =>
      v === "" ? "" : Number(v)
    );

    const blanks: number[] = [];
    let hasError = false;
    balls.forEach((v, idx) => {
      if (v === "") blanks.push(idx);
      else if (typeof v !== "number" || Number.isNaN(v) || v < 0) hasError = true;
    });
    if (hasError) {
      alert("Giá trị không hợp lệ. Chỉ nhập số nguyên ≥ 0 (để trống đúng 1 người thắng).");
      return;
    }
    if (blanks.length !== 1) {
      alert("Mỗi ván phải để trống đúng 1 người (người thắng).");
      return;
    }

    const winnerIndex = blanks[0];
    const sumLosers = balls.reduce<number>((acc, v, i) => {
      if (i === winnerIndex) return acc;
      return acc + (typeof v === "number" && !Number.isNaN(v) ? v : 0);
    }, 0);

    // RULE 99 BI: tổng bi đền của những người thua phải = 99
    if (sumLosers !== 99) {
      alert(
        `Rule 99 bi: Tổng bi đền của những người thua phải = 99.\nHiện tại: ${sumLosers}.`
      );
      return;
    }

    const rowValues: number[] = balls.map((v, i) =>
      i === winnerIndex ? sumLosers : typeof v === "number" && !Number.isNaN(v) ? v : 0
    );

    setRounds((prev) => [
      ...prev,
      { values: rowValues, winnerIndex, totalLoserBalls: sumLosers },
    ]);
    setCurrentInputsSingle(Array(players.length).fill(""));
  };

  const removeRound = (idx: number) =>
    setRounds((prev) => prev.filter((_, i) => i !== idx));

  const totalRounds = rounds.length;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl p-3 sm:p-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Kèo Bi-a 99 bi đánh đền
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              B1: cơ thủ (≤5) • B2: tiền/1 bi • B3: nhập bi đền từng ván. Rule: mỗi ván
              tổng bi đền của người thua = 99.
            </p>
          </div>
          <Link
            href="/keo"
            className="text-xs sm:text-sm text-slate-300 underline decoration-dotted hover:text-white self-start md:self-auto"
          >
            ← Danh sách kèo
          </Link>
        </header>

        {/* Steps */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={[
                "px-3 py-1.5 rounded-full text-xs border",
                step === s
                  ? "bg-white text-slate-900 border-white"
                  : "bg-slate-800/60 text-slate-200 border-white/10",
              ].join(" ")}
            >
              Bước {s}
            </div>
          ))}
          <button
            className="ml-auto px-3 py-1.5 rounded-full text-xs border bg-red-500/10 text-red-200 border-red-500/30 hover:bg-red-500/20 w-auto"
            onClick={resetAll}
          >
            Làm lại
          </button>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 space-y-3">
            <h2 className="text-base sm:text-lg font-semibold">
              Bước 1: Nhập tên cơ thủ (tối đa 5)
            </h2>
            <input
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder="Ví dụ: A, B, C"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <button
                onClick={handleBuildPlayers}
                className="px-3 py-2 rounded-xl text-sm bg-white text-slate-900 hover:opacity-90 w-full sm:w-auto"
              >
                Xác nhận cơ thủ
              </button>
              <span className="text-xs text-slate-400">
                Nhập tên cách nhau bằng dấu phẩy
              </span>
            </div>
            {players.length > 0 && (
              <div className="text-xs sm:text-sm text-slate-300">
                Đã chọn:{" "}
                {players.map((p, i) => (
                  <span key={p} className="mr-2">
                    {i + 1}. {p}
                  </span>
                ))}
              </div>
            )}
            {!canGoStep2 && players.length > 0 && (
              <div className="text-xs text-amber-300">
                Cần từ 2–5 cơ thủ. Hiện có {players.length}.
              </div>
            )}
            <div className="pt-2">
              <button
                disabled={!canGoStep2}
                onClick={() => setStep(2)}
                className={[
                  "px-3 py-2 rounded-xl text-sm w-full sm:w-auto",
                  canGoStep2
                    ? "bg-cyan-400 text-slate-900 hover:opacity-90"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed",
                ].join(" ")}
              >
                Tiếp tục → Bước 2
              </button>
            </div>
          </section>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 space-y-3">
            <h2 className="text-base sm:text-lg font-semibold">
              Bước 2: Tiền trên 1 bi
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="number"
                min={0}
                value={unit}
                onChange={(e) =>
                  setUnit(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="VD: 5.000"
                className="w-full sm:w-40 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
              />
              <span className="text-sm text-slate-400">đ / bi</span>
            </div>
            {!canGoStep3 && (
              <div className="text-xs text-amber-300">
                Vui lòng nhập số tiền &gt; 0.
              </div>
            )}
            <div className="pt-2">
              <button
                disabled={!canGoStep3}
                onClick={() => setStep(3)}
                className={[
                  "px-3 py-2 rounded-xl text-sm w-full sm:w-auto",
                  canGoStep3
                    ? "bg-cyan-400 text-slate-900 hover:opacity-90"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed",
                ].join(" ")}
              >
                Tiếp tục → Bước 3
              </button>
            </div>
          </section>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Bước 3: Nhập bi đền từng ván (1 người thắng ăn hết)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Mỗi ván: nhập bi đền cho N-1 người thua, để trống đúng 1 người thắng.
                  Tổng bi đền của người thua bắt buộc ={" "}
                  <span className="font-semibold text-emerald-300">99</span>.
                </p>
              </div>
              <div className="text-xs sm:text-sm text-slate-300">
                Tổng số ván:{" "}
                <span className="font-semibold text-emerald-300">
                  {totalRounds}
                </span>
              </div>
            </div>

            {/* Form nhập ván */}
            <div className="space-y-2">
              {/* Mobile: card view */}
              <div className="space-y-3 md:hidden">
                {players.map((p, idx) => (
                  <div
                    key={p}
                    className="rounded-xl border border-white/10 bg-slate-800/40 p-3 space-y-1.5"
                  >
                    <div className="text-sm font-medium text-slate-100">
                      {p}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={currentInputsSingle[idx]}
                      onChange={(e) => {
                        const v = e.target.value;
                        const next = [...currentInputsSingle];
                        next[idx] = v === "" ? "" : Math.max(0, Number(v));
                        setCurrentInputsSingle(next);
                      }}
                      placeholder="Bi đền (để trống nếu là winner)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                ))}
                <button
                  onClick={addRound}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white text-slate-900 hover:opacity-90"
                >
                  Thêm ván
                </button>
              </div>

              {/* Desktop: table view */}
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-[560px] rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/60">
                      <tr>
                        {players.map((p) => (
                          <th
                            key={p}
                            className="text-left px-3 py-2 border-b border-white/10"
                          >
                            {p}
                          </th>
                        ))}
                        <th className="text-left px-3 py-2 border-b border-white/10 w-36">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-slate-800/30">
                        {players.map((p, idx) => (
                          <td
                            key={p}
                            className="px-3 py-2 border-b border-white/5"
                          >
                            <input
                              type="number"
                              min={0}
                              value={currentInputsSingle[idx]}
                              onChange={(e) => {
                                const v = e.target.value;
                                const next = [...currentInputsSingle];
                                next[idx] =
                                  v === "" ? "" : Math.max(0, Number(v));
                                setCurrentInputsSingle(next);
                              }}
                              placeholder="bi đền (để trống = winner)"
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-white/30"
                            />
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <button
                            onClick={addRound}
                            className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:opacity-90"
                          >
                            Thêm ván
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Lịch sử ván */}
            <div className="space-y-3">
              {rounds.map((r, idx) => {
                const net = ballsNetByRound(r, players.length);
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="font-semibold text-sm sm:text-base">
                        Ván {idx + 1} — Winner:{" "}
                        <span className="text-emerald-300">
                          {players[r.winnerIndex]}
                        </span>{" "}
                        (ăn {r.totalLoserBalls} bi)
                      </div>
                      <button
                        onClick={() => removeRound(idx)}
                        className="px-2 py-1 rounded-md text-xs bg-red-500/15 text-red-200 hover:bg-red-500/25"
                      >
                        Xóa
                      </button>
                    </div>

                    <div className="px-3 pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        {players.map((p, i) => (
                          <div
                            key={p}
                            className={[
                              "flex items-center justify-between px-3 py-2 rounded-lg border text-xs sm:text-sm",
                              net[i] > 0
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                                : net[i] < 0
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                                : "bg-slate-700/30 border-white/10 text-slate-200",
                            ].join(" ")}
                          >
                            <span>{p}</span>
                            <span>
                              {net[i] > 0 ? "+" : ""}
                              {net[i]} bi
                              {typeof unit === "number" && unit > 0
                                ? ` (${(net[i] * unit).toLocaleString()} đ)`
                                : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {rounds.length === 0 && (
                <div className="px-3 py-4 text-xs sm:text-sm text-slate-400 border border-white/10 rounded-xl bg-slate-800/40">
                  Chưa có ván nào. Nhập bi đền cho từng người, để trống đúng 1 winner,
                  rồi bấm “Thêm ván”.
                </div>
              )}
            </div>

            {/* Tổng kết */}
            <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3 space-y-2">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">
                Tổng kết sau {totalRounds} ván 99 bi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {players.map((p, i) => (
                  <div
                    key={p}
                    className={[
                      "flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-2 rounded-lg border text-xs sm:text-sm gap-1",
                      ballsTotals[i] > 0
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                        : ballsTotals[i] < 0
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                        : "bg-slate-700/30 border-white/10 text-slate-200",
                    ].join(" ")}
                  >
                    <span>{p}</span>
                    <div className="flex flex-col items-end gap-0.5">
                      <span>
                        Tổng bi:{" "}
                        <strong>
                          {ballsTotals[i] > 0 ? "+" : ""}
                          {ballsTotals[i]} bi
                        </strong>
                      </span>
                      <span className="text-[11px] sm:text-xs opacity-80">
                        Tiền:{" "}
                        {typeof unit === "number"
                          ? moneyTotals[i].toLocaleString()
                          : 0}{" "}
                        đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Gợi ý: có thể coi “về 99 bi dương” là thắng kèo dài hạn, tuỳ nhóm tự
                thống nhất thêm luật.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}