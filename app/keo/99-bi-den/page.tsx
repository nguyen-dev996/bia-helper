"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Round = {
  /** matrix[i][j] = số bi người i đền cho người j (i ≠ j) */
  matrix: number[][];
};

export default function BiA99Page() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [unit, setUnit] = useState<number | "">("");
  const [rounds, setRounds] = useState<Round[]>([]);

  /** Input ma trận NxN (đường chéo vô hiệu) */
  const [currentInputsMatrix, setCurrentInputsMatrix] = useState<
    (number | "")[][]
  >([]);

  const canGoStep2 = players.length >= 2 && players.length <= 4;
  const canGoStep3 = typeof unit === "number" && unit > 0;

  const handleBuildPlayers = () => {
    const list = playerInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const unique: string[] = [];
    for (const name of list) {
      if (!unique.includes(name)) unique.push(name);
      if (unique.length === 4) break; // giới hạn 4 cơ thủ
    }
    setPlayers(unique);
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
    setCurrentInputsMatrix([]);
  };

  /** Tổng tiền của mỗi người từ tất cả các ván, nhân với unit */
  const totals = useMemo(() => {
    const arr: number[] = Array(players.length).fill(0);
    const u = typeof unit === "number" ? unit : 0;

    for (const r of rounds) {
      const N = r.matrix.length;
      for (let i = 0; i < N; i++) {
        let inBi = 0;
        let outBi = 0;
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          outBi += r.matrix[i][j] || 0;
          inBi += r.matrix[j][i] || 0;
        }
        arr[i] += (inBi - outBi) * u;
      }
    }
    return arr;
  }, [rounds, players.length, unit]);

  /** Thêm ván mới dựa trên ma trận bi đền hiện tại */
  const addRound = () => {
    if (!players.length) return;
    const N = players.length;
    const normalized: number[][] = Array.from({ length: N }, () =>
      Array(N).fill(0)
    );
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
      alert("Giá trị không hợp lệ. Chỉ nhập số nguyên ≥ 0 (để trống = 0).");
      return;
    }

    const isAllZero = normalized.every((row) => row.every((v) => v === 0));
    if (isAllZero) {
      alert("Ván rỗng: tất cả ô đều 0. Hãy nhập ít nhất một kết quả đền.");
      return;
    }

    setRounds((prev) => [...prev, { matrix: normalized }]);
    setCurrentInputsMatrix(
      Array.from({ length: N }, () => Array(N).fill(""))
    );
  };

  const removeRound = (idx: number) =>
    setRounds((prev) => prev.filter((_, i) => i !== idx));

  /** Net bi theo ván (không nhân unit) để hiển thị */
  const biNetByRound = (r: Round) => {
    const N = players.length;
    const net: number[] = Array(N).fill(0);

    for (let i = 0; i < N; i++) {
      let inBi = 0,
        outBi = 0;
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        outBi += r.matrix[i][j] || 0;
        inBi += r.matrix[j][i] || 0;
      }
      net[i] = inBi - outBi;
    }

    return net;
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl p-3 sm:p-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Kèo bi-a 99 bi (đánh đền)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              B1: nhập cơ thủ • B2: tiền / 1 bi • B3: nhập bi đền từng ván (ai
              đền ai bao nhiêu bi).
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
              Bước 1: Nhập tên cơ thủ (2–4 người)
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
                Cần từ 2–4 cơ thủ. Hiện có {players.length}.
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
                placeholder="VD: 1000"
                className="w-full sm:w-40 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
              />
              <span className="text-sm text-slate-400">đ / bi</span>
            </div>
            {!canGoStep3 && (
              <div className="text-xs text-amber-300">
                Vui lòng nhập số tiền &gt; 0.
              </div>
            )}
            <div className="pt-2 flex gap-2 flex-wrap">
              <button
                onClick={() => setStep(1)}
                className="px-3 py-2 rounded-xl text-sm bg-slate-700 text-slate-200 hover:bg-slate-600 w-full sm:w-auto"
              >
                ← Quay lại Bước 1
              </button>
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
                Bước 3: Nhập kết quả từng ván (bi đền)
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-400">
              Ma trận: <strong>Hàng i → Cột j</strong> là số bi{" "}
              <strong>người i đền cho người j</strong> (phạm lỗi, thua, bị phạt
              trong ván 99 bi). Để trống = 0. Đường chéo (i = j) vô hiệu.
            </p>

            {/* Form nhập ma trận */}
            <div className="overflow-x-auto">
              <div className="min-w-[520px] rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-800/60">
                    <tr>
                      <th className="px-3 py-2 border-b border-white/10 text-left">
                        Người đền ↓ / Người nhận →
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
                              placeholder={i === j ? "—" : "bi đền"}
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

            {/* Lịch sử ván */}
            <div className="space-y-3">
              {rounds.map((r, idx) => {
                const net = biNetByRound(r);
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="font-semibold text-sm sm:text-base">
                        Ván {idx + 1}
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
                              {net[i]} bi
                              {typeof unit === "number" && unit > 0
                                ? ` (${(net[i] * unit).toLocaleString()} đ)`
                                : ""}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Bảng đối chiếu chi tiết của ván */}
                      <div className="overflow-x-auto mt-2">
                        <table className="min-w-[520px] w-full text-xs border border-white/10 rounded-lg overflow-hidden">
                          <thead className="bg-slate-800/60">
                            <tr>
                              <th className="px-2 py-1 text-left">
                                Đền ↓ / Nhận →
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
                    </div>
                  </div>
                );
              })}

              {rounds.length === 0 && (
                <div className="px-3 py-4 text-xs sm:text-sm text-slate-400 border border-white/10 rounded-xl bg-slate-800/40">
                  Chưa có ván nào. Nhập ma trận bi đền rồi bấm “Thêm ván”.
                </div>
              )}
            </div>

            {/* Tổng kết tiền */}
            <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3">
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

            {/* Gợi ý cách dùng */}
            {players.length === 2 && (
              <div className="text-xs text-slate-400 mt-2">
                <div className="mb-1 font-semibold">Ví dụ:</div>
                <div>
                  - Nếu A phạm lỗi và đền cho B 10 bi ⇒ nhập ô A→B = 10, còn lại
                  để trống.
                </div>
                <div>
                  - Nếu trong cùng 1 ván A đền B 10 bi, B đền A 4 bi ⇒ A→B = 10,
                  B→A = 4 (app sẽ tự trừ/ cộng chéo).
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
