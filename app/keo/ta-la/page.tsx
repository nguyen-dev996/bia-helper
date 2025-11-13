"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

/** Round item có thể là 'single' (1 người thắng ăn hết) hoặc 'matrix' (đấu theo cặp) */
type Round =
  | {
      type: "single";
      /** values[i]: nếu là winnerIndex -> tổng lá thua, còn lại là lá thua đã nhập */
      values: number[];
      winnerIndex: number;
    }
  | {
      type: "matrix";
      /** matrix[i][j] = số lá người i trả cho người j (i ≠ j) */
      matrix: number[][];
    };

type Mode = "single" | "matrix";

export default function TaLaPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [unit, setUnit] = useState<number | "">("");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [mode, setMode] = useState<Mode>("single");

  /** Input cho chế độ 'single': mảng độ dài N; để trống đúng 1 người (winner) */
  const [currentInputsSingle, setCurrentInputsSingle] = useState<(number | "")[]>([]);

  /** Input cho chế độ 'matrix': ma trận NxN (đường chéo vô hiệu) */
  const [currentInputsMatrix, setCurrentInputsMatrix] = useState<(number | "")[][]>([]);

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
    setCurrentInputsMatrix(
      Array.from({ length: unique.length }, () => Array(unique.length).fill(""))
    );
    setStep(2);
  };

  const resetAll = () => {
    setStep(1);
    setPlayerInput("");
    setPlayers([]);
    setUnit("");
    setRounds([]);
    setCurrentInputsSingle([]);
    setCurrentInputsMatrix([]);
    setMode("single");
  };

  /** Tổng tiền của mỗi người từ tất cả các ván, nhân với unit */
  const totals = useMemo(() => {
    const arr: number[] = Array(players.length).fill(0);
    const u = typeof unit === "number" ? unit : 0;

    for (const r of rounds) {
      if (r.type === "single") {
        r.values.forEach((v, i) => {
          if (i === r.winnerIndex) arr[i] += v * u; // winner cộng
          else arr[i] -= v * u; // loser trừ
        });
      } else if (r.type === "matrix") {
        const N = r.matrix.length;
        for (let i = 0; i < N; i++) {
          let inLeaves = 0;
          let outLeaves = 0;
          for (let j = 0; j < N; j++) {
            if (i === j) continue;
            outLeaves += r.matrix[i][j] || 0;
            inLeaves += r.matrix[j][i] || 0;
          }
          arr[i] += (inLeaves - outLeaves) * u;
        }
      }
    }
    return arr;
  }, [rounds, players.length, unit]);

  /** Thêm ván theo mode hiện tại */
  const addRound = () => {
    if (!players.length) return;

    if (mode === "single") {
      // chuẩn hoá input: "" -> blank (để xác định winner), còn lại Number >= 0
      const leafs: (number | "")[] = currentInputsSingle.map((v) =>
        v === "" ? "" : Number(v)
      );

      // validate
      const blanks: number[] = [];
      let hasError = false;
      leafs.forEach((v, idx) => {
        if (v === "") blanks.push(idx);
        else if (typeof v !== "number" || Number.isNaN(v) || v < 0) hasError = true;
      });
      if (hasError) {
        alert("Giá trị không hợp lệ. Chỉ nhập số nguyên ≥ 0 (để trống đúng 1 người thắng).");
        return;
      }
      if (blanks.length !== 1) {
        alert("Mỗi ván (chế độ 1) phải để trống đúng 1 người (người thắng).");
        return;
      }

      const winnerIndex = blanks[0];
      const sumLosers = leafs.reduce<number>((acc, v, i) => {
        if (i === winnerIndex) return acc;
        return acc + (typeof v === "number" && !Number.isNaN(v) ? v : 0);
      }, 0);

      const rowValues: number[] = leafs.map((v, i) =>
        i === winnerIndex ? sumLosers : typeof v === "number" && !Number.isNaN(v) ? v : 0
      );

      setRounds((prev) => [...prev, { type: "single", values: rowValues, winnerIndex }]);
      setCurrentInputsSingle(Array(players.length).fill(""));
      return;
    }

    if (mode === "matrix") {
      const N = players.length;
      const normalized: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
      let hasError = false;

      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          if (i === j) {
            normalized[i][j] = 0;
            continue;
          }
          const raw = currentInputsMatrix[i]?.[j];
          if (raw === "" || raw === undefined) {
            normalized[i][j] = 0;
          } else if (typeof raw !== "number" || Number.isNaN(raw) || raw < 0) {
            hasError = true;
          } else {
            normalized[i][j] = raw;
          }
        }
      }

      if (hasError) {
        alert("Giá trị không hợp lệ (chế độ 2). Chỉ nhập số nguyên ≥ 0 (để trống = 0).");
        return;
      }

      const isAllZero = normalized.every((row) => row.every((v) => v === 0));
      if (isAllZero) {
        alert("Ván rỗng: tất cả ô đều 0. Hãy nhập ít nhất một kết quả thắng/thua.");
        return;
      }

      setRounds((prev) => [...prev, { type: "matrix", matrix: normalized }]);
      setCurrentInputsMatrix(
        Array.from({ length: N }, () => Array(N).fill(""))
      );
    }
  };

  const removeRound = (idx: number) =>
    setRounds((prev) => prev.filter((_, i) => i !== idx));

  /** Net lá theo ván (không nhân unit) để hiển thị */
  const leavesNetByRound = (r: Round) => {
    const N = players.length;
    const net: number[] = Array(N).fill(0);

    if (r.type === "single") {
      // winner nhận tổng lá thua, losers trả số lá của họ
      r.values.forEach((v, i) => {
        if (i === r.winnerIndex) net[i] += v;
        else net[i] -= v;
      });
    } else if (r.type === "matrix") {
      for (let i = 0; i < N; i++) {
        let inLeaves = 0,
          outLeaves = 0;
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          outLeaves += r.matrix[i][j] || 0;
          inLeaves += r.matrix[j][i] || 0;
        }
        net[i] = inLeaves - outLeaves;
      }
    }
    return net;
  };

  const scrollToSummary = () => {
    const el = document.getElementById("summary");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div
        className={[
          "mx-auto max-w-5xl px-3 sm:px-4 pt-3 sm:pt-4",
          step === 3 ? "pb-24 sm:pb-28" : "pb-4",
        ].join(" ")}
      >
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Kèo Tá lả (Độ)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              B1: người chơi (≤5) • B2: tiền/1 lá • B3: chọn chế độ nhập & ghi ván.
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
              Bước 1: Nhập tên người chơi (tối đa 5)
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
                Xác nhận người chơi
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
                Cần từ 2–5 người chơi. Hiện có {players.length}.
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
              Bước 2: Tiền trên 1 “lá”
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="number"
                min={0}
                value={unit}
                onChange={(e) =>
                  setUnit(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="VD: 5000"
                className="w-full sm:w-40 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
              />
              <span className="text-sm text-slate-400">đ / lá</span>
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
              <h2 className="text-base sm:text-lg font-semibold">
                Bước 3: Nhập kết quả từng ván
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="mode"
                    value="single"
                    checked={mode === "single"}
                    onChange={() => setMode("single")}
                    className="h-3 w-3"
                  />
                  <span>Người thắng ăn hết</span>
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="mode"
                    value="matrix"
                    checked={mode === "matrix"}
                    onChange={() => setMode("matrix")}
                    className="h-3 w-3"
                  />
                  <span>1 ván có thể thắng người này, thua người kia</span>
                </label>
              </div>
            </div>

            {/* Hướng dẫn theo mode */}
            {mode === "single" ? (
              <p className="text-xs sm:text-sm text-slate-400">
                Nhập lá thua cho <strong>N-1 người</strong>, để trống đúng{" "}
                <strong>1 người</strong> (người thắng). Người thắng = tổng lá
                thua của người còn lại.
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400">
                Ma trận: <strong>Hàng i → Cột j</strong> là số lá{" "}
                <strong>người i trả cho người j</strong> (để trống = 0). Đường
                chéo (i = j) vô hiệu.
              </p>
            )}

            {/* Bảng / form nhập theo mode */}
            <div className="space-y-2">
              {mode === "single" ? (
                <>
                  {/* Mobile: card / list view */}
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
                          placeholder="Lá thua (để trống nếu là winner)"
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
                                  placeholder="lá thua (để trống = winner)"
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
                </>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[520px] rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-800/60">
                        <tr>
                          <th className="px-3 py-2 border-b border-white/10 text-left">
                            Người trả ↓ / Người nhận →
                          </th>
                          {players.map((p) => (
                            <th
                              key={p}
                              className="px-3 py-2 border-b border-white/10 text-left"
                            >
                              {p}
                            </th>
                          ))}
                          <th className="px-3 py-2 border-b border-white/10 w-36 text-left">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((rowName, i) => (
                          <tr key={rowName} className="bg-slate-800/30">
                            <td className="px-3 py-2 border-b border-white/5 text-slate-300">
                              {rowName}
                            </td>
                            {players.map((colName, j) => (
                              <td
                                key={colName}
                                className="px-3 py-2 border-b border-white/5"
                              >
                                <input
                                  type="number"
                                  min={0}
                                  disabled={i === j}
                                  value={currentInputsMatrix[i]?.[j] ?? ""}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setCurrentInputsMatrix((prev) => {
                                      const next = prev.map((r) => [...r]);
                                      next[i][j] =
                                        v === "" ? "" : Math.max(0, Number(v));
                                      return next;
                                    });
                                  }}
                                  placeholder={i === j ? "—" : "lá"}
                                  className={[
                                    "w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-white/30",
                                    i === j ? "opacity-50 cursor-not-allowed" : "",
                                  ].join(" ")}
                                />
                              </td>
                            ))}
                            {i === 0 && (
                              <td
                                rowSpan={players.length}
                                className="px-3 py-2 align-top"
                              >
                                <button
                                  onClick={addRound}
                                  className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:opacity-90"
                                >
                                  Thêm ván
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Lịch sử ván */}
            <div className="space-y-3">
              {rounds.map((r, idx) => {
                const net = leavesNetByRound(r);
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="font-semibold text-sm sm:text-base">
                        Ván {idx + 1} —{" "}
                        {r.type === "single" ? "Chế độ 1" : "Chế độ 2"}
                      </div>
                      <button
                        onClick={() => removeRound(idx)}
                        className="px-2 py-1 rounded-md text-xs bg-red-500/15 text-red-200 hover:bg-red-500/25"
                      >
                        Xóa
                      </button>
                    </div>

                    <div className="px-3 pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
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
                              {net[i]} lá
                              {typeof unit === "number" && unit > 0
                                ? ` (${(net[i] * unit).toLocaleString()} đ)`
                                : ""}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Hiển thị dữ liệu ván để đối chiếu */}
                      {r.type === "single" ? (
                        <div className="text-xs text-slate-300">
                          Winner:{" "}
                          <strong>{players[r.winnerIndex]}</strong> — Nhận{" "}
                          {r.values[r.winnerIndex]} lá.
                        </div>
                      ) : (
                        <div className="overflow-x-auto mt-2">
                          <table className="min-w-[520px] w-full text-xs border border-white/10 rounded-lg overflow-hidden">
                            <thead className="bg-slate-800/60">
                              <tr>
                                <th className="px-2 py-1 text-left">
                                  Trả ↓ / Nhận →
                                </th>
                                {players.map((p) => (
                                  <th key={p} className="px-2 py-1 text-left">
                                    {p}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {players.map((row, i) => (
                                <tr key={row} className="hover:bg-white/5">
                                  <td className="px-2 py-1 text-slate-300">
                                    {row}
                                  </td>
                                  {players.map((col, j) => (
                                    <td
                                      key={col}
                                      className={[
                                        "px-2 py-1 border-t border-white/10",
                                        i === j
                                          ? "text-slate-500"
                                          : "text-slate-200",
                                      ].join(" ")}
                                    >
                                      {i === j ? "—" : r.matrix[i][j]}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {rounds.length === 0 && (
                <div className="px-3 py-4 text-xs sm:text-sm text-slate-400 border border-white/10 rounded-xl bg-slate-800/40">
                  Chưa có ván nào. Chọn chế độ, nhập dữ liệu, rồi bấm “Thêm
                  ván”.
                </div>
              )}
            </div>

            {/* Tổng kết tiền */}
            <div
              id="summary"
              className="rounded-xl border border-white/10 bg-slate-800/40 p-3"
            >
              <h3 className="font-semibold mb-2 text-sm sm:text-base">
                Tổng kết
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {players.map((p, i) => (
                  <div
                    key={p}
                    className={[
                      "flex items-center justify-between px-3 py-2 rounded-lg border text-xs sm:text-sm",
                      totals[i] > 0
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                        : totals[i] < 0
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                        : "bg-slate-700/30 border-white/10 text-slate-200",
                    ].join(" ")}
                  >
                    <span>{p}</span>
                    <span>
                      {typeof unit === "number"
                        ? totals[i].toLocaleString()
                        : 0}{" "}
                      đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ví dụ minh họa */}
            {players.length === 3 && (
              <div className="text-xs text-slate-400">
                <div className="mb-1 font-semibold">Ví dụ:</div>
                <div>
                  - Chế độ 1: nếu A=2, B=3, C= (để trống) ⇒ C thắng 5 lá.
                </div>
                <div>
                  - Chế độ 2: đặt A→B = x, B→C = y, C→A = z, C→B = z (C đền A,B
                  z lá).
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Bottom bar cố định Step 3 */}
      {step === 3 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-900/95 backdrop-blur px-3 sm:px-4 py-2">
          <div className="mx-auto max-w-5xl flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-xs text-slate-300 mr-2">
              <span className="font-semibold">Thanh công cụ</span>
              <span>
                Đang có {rounds.length} ván •{" "}
                {typeof unit === "number" ? `${unit.toLocaleString()} đ / lá` : "chưa nhập tiền / lá"}
              </span>
            </div>

            <button
              onClick={addRound}
              className="flex-1 sm:flex-none sm:w-40 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white text-slate-900 hover:opacity-90"
            >
              Thêm ván
            </button>
            <button
              onClick={scrollToSummary}
              className="flex-1 sm:flex-none sm:w-40 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-cyan-500 text-slate-900 hover:opacity-95"
            >
              Xem tổng kết
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
