"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Round = {
  /** delta[i] = thay đổi số bi của người i ở ván này (âm: bớt bi, dương: thêm bi) */
  deltas: number[];
  note?: string;
};

export default function Bia99BiDanhDenPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);

  // Mốc bi chung (vd: 99, 81, 61...)
  const [targetBase, setTargetBase] = useState<number | "">(99);
  // Chấp bi từng người (được chấp = nhập số dương → mốc thực tế = base - chấp)
  const [handicaps, setHandicaps] = useState<(number | "")[]>([]);

  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentDeltas, setCurrentDeltas] = useState<(number | "")[]>([]);
  const [currentNote, setCurrentNote] = useState("");

  const canGoStep2 = players.length >= 2 && players.length <= 5;

  /** Mốc bi thực tế của từng người: base - handicap */
  const startBalls = useMemo(() => {
    const base = typeof targetBase === "number" ? targetBase : 0;
    return players.map((_, i) => {
      const h = handicaps[i];
      const handicapVal = typeof h === "number" ? h : 0;
      const val = base - handicapVal;
      return val;
    });
  }, [players, targetBase, handicaps]);

  const hasInvalidStart = startBalls.some((v) => v <= 0 || Number.isNaN(v));
  const canGoStep3 =
    typeof targetBase === "number" && targetBase > 0 && !hasInvalidStart && players.length >= 2;

  /** Tính bi còn lại & ván kết thúc (về 0) cho từng người */
  const progress = useMemo(() => {
    const N = players.length;
    const remain = startBalls.map((v) => (Number.isFinite(v) ? v : 0));
    const finishRound: (number | null)[] = Array(N).fill(null);

    rounds.forEach((r, roundIndex) => {
      r.deltas.forEach((delta, i) => {
        if (i >= N) return;
        remain[i] += delta;
        if (remain[i] <= 0 && finishRound[i] === null) {
          finishRound[i] = roundIndex + 1; // ván thứ mấy
        }
      });
    });

    return { remain, finishRound };
  }, [rounds, startBalls, players.length]);

  /** Bảng xếp hạng theo thứ tự về 0 bi */
  const ranking = useMemo(() => {
    return players
      .map((name, i) => ({
        name,
        index: i,
        finish: progress.finishRound[i],
        remain: progress.remain[i],
      }))
      .sort((a, b) => {
        if (a.finish === null && b.finish === null) return a.index - b.index;
        if (a.finish === null) return 1;
        if (b.finish === null) return -1;
        return a.finish - b.finish;
      });
  }, [players, progress]);

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
    setHandicaps(Array(unique.length).fill(""));
    setCurrentDeltas(Array(unique.length).fill(""));
    setStep(2);
  };

  const resetAll = () => {
    setStep(1);
    setPlayerInput("");
    setPlayers([]);
    setTargetBase(99);
    setHandicaps([]);
    setRounds([]);
    setCurrentDeltas([]);
    setCurrentNote("");
  };

  /** Δ bi theo ván (chỉ để hiển thị, thực ra chính là deltas) */
  const deltasByRound = (r: Round) => r.deltas;

  /** Thêm ván mới */
  const addRound = () => {
    if (!players.length) return;
    const numeric: number[] = [];
    let hasError = false;
    let allZero = true;

    currentDeltas.forEach((v) => {
      if (v === "" || v === undefined) {
        numeric.push(0);
      } else if (typeof v !== "number" || Number.isNaN(v)) {
        hasError = true;
        numeric.push(0);
      } else {
        numeric.push(v);
        if (v !== 0) allZero = false;
      }
    });

    if (hasError) {
      alert("Giá trị không hợp lệ. Mỗi ô chỉ nhập số (có thể âm hoặc dương).");
      return;
    }
    if (allZero) {
      alert("Ván rỗng: tất cả người đều 0 bi (không có thay đổi).");
      return;
    }

    setRounds((prev) => [
      ...prev,
      {
        deltas: numeric,
        note: currentNote.trim() || undefined,
      },
    ]);
    setCurrentDeltas(Array(players.length).fill(""));
    setCurrentNote("");
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
              Mỗi cơ thủ có mốc bi (mặc định 99). Đánh ăn bớt bi, phạm lỗi/đền cộng bi.
              Ai về 0 bi sớm nhất là thắng. Hỗ trợ chấp bi & ghi chú foul/đền đặc biệt.
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

        {/* Step 1: Cơ thủ */}
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
                Nhập tên, cách nhau bằng dấu phẩy.
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

        {/* Step 2: Mốc bi & chấp */}
        {step === 2 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 space-y-4">
            <h2 className="text-base sm:text-lg font-semibold">
              Bước 2: Thiết lập mốc bi & kèo chấp
            </h2>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm text-slate-300">
                Mốc bi chuẩn (vd: 99, 81, 61, 101...)
              </label>
              <input
                type="number"
                min={1}
                value={targetBase}
                onChange={(e) =>
                  setTargetBase(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="VD: 99"
                className="w-full sm:w-40 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
              />
              <p className="text-[11px] sm:text-xs text-slate-400">
                Đây là mốc cơ bản. Kèo chấp sẽ chỉnh mốc từng người dựa trên số này.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-200">
                Kèo chấp (bi) cho từng cơ thủ
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Nhập số bi <strong>được chấp</strong> cho từng người. Mốc thực tế =
                <strong> Mốc chuẩn − chấp</strong>. (Ví dụ: mốc 99, được chấp 10 → chỉ
                cần 89 bi là về 0.)
              </p>

              <div className="space-y-2">
                {players.map((p, idx) => {
                  const base = typeof targetBase === "number" ? targetBase : 0;
                  const h = handicaps[idx];
                  const hv = typeof h === "number" ? h : 0;
                  const effective = base - hv;

                  return (
                    <div
                      key={p}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl bg-slate-800/50 border border-white/10 px-3 py-2 text-xs sm:text-sm"
                    >
                      <div className="flex-1 font-medium text-slate-100">{p}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 whitespace-nowrap">
                          Chấp (bi):
                        </span>
                        <input
                          type="number"
                          value={handicaps[idx] ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setHandicaps((prev) => {
                              const next = [...prev];
                              next[idx] = v === "" ? "" : Number(v);
                              return next;
                            });
                          }}
                          placeholder="VD: 10"
                          className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-white/30"
                        />
                        <span className="text-slate-300 whitespace-nowrap">
                          Mốc:{" "}
                          <span
                            className={
                              effective > 0
                                ? "text-emerald-300 font-semibold"
                                : "text-rose-300 font-semibold"
                            }
                          >
                            {effective}
                          </span>{" "}
                          bi
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasInvalidStart && (
                <div className="text-[11px] sm:text-xs text-amber-300 mt-1">
                  Mốc bi thực tế của mỗi người phải &gt; 0. Hãy chỉnh lại mốc chuẩn hoặc
                  kèo chấp.
                </div>
              )}
            </div>

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

        {/* Step 3: Nhập ván */}
        {step === 3 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Bước 3: Nhập Δ bi & ghi chú từng ván
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Mỗi ván, nhập <strong>Δ bi</strong> cho từng người:
                  <br />
                  <span className="text-[11px] sm:text-xs">
                    • Âm (−): bớt bi &rarr; đánh ăn, tiến gần 0.
                    <br />
                    • Dương (+): thêm bi &rarr; bị foul, đánh đền, phạt...
                  </span>
                </p>
              </div>
              <div className="text-xs sm:text-sm text-slate-300">
                Tổng số ván:{" "}
                <span className="font-semibold text-emerald-300">
                  {totalRounds}
                </span>
                <br />
                Mốc chuẩn:{" "}
                <span className="font-semibold">
                  {typeof targetBase === "number" ? targetBase : "-"} bi
                </span>
              </div>
            </div>

            {/* Form nhập ván */}
            <div className="space-y-3">
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
                      value={currentDeltas[idx]}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCurrentDeltas((prev) => {
                          const next = [...prev];
                          next[idx] = v === "" ? "" : Number(v);
                          return next;
                        });
                      }}
                      placeholder="Δ bi (vd: -5 hoặc +10)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Ghi chú ván</label>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="VD: A đền 20 vì foul lớn, B miss 3 cơ liên tiếp..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-white/30 min-h-[60px]"
                  />
                </div>
                <button
                  onClick={addRound}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white text-slate-900 hover:opacity-90"
                >
                  Thêm ván
                </button>
              </div>

              {/* Desktop: table view */}
              <div className="hidden md:block space-y-2">
                <div className="overflow-x-auto">
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
                          <th className="text-left px-3 py-2 border-b border-white/10 w-40">
                            Ghi chú ván
                          </th>
                          <th className="text-left px-3 py-2 border-b border-white/10 w-32">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-slate-800/30 align-top">
                          {players.map((p, idx) => (
                            <td
                              key={p}
                              className="px-3 py-2 border-b border-white/5"
                            >
                              <input
                                type="number"
                                value={currentDeltas[idx]}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setCurrentDeltas((prev) => {
                                    const next = [...prev];
                                    next[idx] = v === "" ? "" : Number(v);
                                    return next;
                                  });
                                }}
                                placeholder="Δ bi (vd: -5, +10)"
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-white/30"
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2 border-b border-white/5">
                            <textarea
                              value={currentNote}
                              onChange={(e) => setCurrentNote(e.target.value)}
                              placeholder="Foul, đền đặc biệt, note ván..."
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-white/30 min-h-[40px]"
                            />
                          </td>
                          <td className="px-3 py-2 border-b border-white/5">
                            <button
                              onClick={addRound}
                              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:opacity-90 text-xs"
                            >
                              Thêm ván
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ví dụ: A ăn mạnh, bạn có thể nhập Δ A = -15; B foul nặng, Δ B = +20;
                  C đánh hoà thế, Δ C = 0.
                </p>
              </div>
            </div>

            {/* Lịch sử ván */}
            <div className="space-y-3">
              {rounds.map((r, idx) => {
                const deltas = deltasByRound(r);
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

                    <div className="px-3 pb-3 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {players.map((p, i) => (
                          <div
                            key={p}
                            className={[
                              "flex items-center justify-between px-3 py-2 rounded-lg border text-xs sm:text-sm",
                              deltas[i] < 0
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                                : deltas[i] > 0
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                                : "bg-slate-700/30 border-white/10 text-slate-200",
                            ].join(" ")}
                          >
                            <span>{p}</span>
                            <span>
                              Δ{" "}
                              {deltas[i] > 0 ? `+${deltas[i]}` : deltas[i] === 0 ? "0" : deltas[i]}{" "}
                              bi
                            </span>
                          </div>
                        ))}
                      </div>

                      {r.note && (
                        <div className="text-[11px] sm:text-xs text-slate-300 border-t border-white/10 pt-2">
                          <span className="font-semibold text-slate-200">
                            Ghi chú ván:
                          </span>{" "}
                          {r.note}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {rounds.length === 0 && (
                <div className="px-3 py-4 text-xs sm:text-sm text-slate-400 border border-white/10 rounded-xl bg-slate-800/40">
                  Chưa có ván nào. Nhập Δ bi cho từng người, thêm ghi chú (nếu cần), rồi
                  bấm “Thêm ván”.
                </div>
              )}
            </div>

            {/* Tổng kết & bảng xếp hạng */}
            <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3 space-y-3">
              <h3 className="font-semibold text-sm sm:text-base mb-1">
                Tổng kết sau {totalRounds} ván
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {players.map((p, i) => (
                  <div
                    key={p}
                    className={[
                      "flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-2 rounded-lg border text-xs sm:text-sm gap-1",
                      progress.remain[i] <= 0
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                        : "bg-slate-700/30 border-white/10 text-slate-200",
                    ].join(" ")}
                  >
                    <span>{p}</span>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[11px] sm:text-xs text-slate-300">
                        Mốc:{" "}
                        <strong>
                          {startBalls[i]} bi
                        </strong>
                      </span>
                      <span>
                        Còn lại:{" "}
                        <strong>
                          {progress.remain[i] < 0 ? 0 : progress.remain[i]} bi
                        </strong>
                      </span>
                      <span className="text-[11px] sm:text-xs opacity-80">
                        Về 0 tại ván:{" "}
                        {progress.finishRound[i] ?? (
                          <span className="text-slate-400">chưa</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-2">
                <h4 className="text-xs sm:text-sm font-semibold mb-1">
                  Bảng xếp hạng (ai về 0 sớm hơn)
                </h4>
                {ranking.every((r) => r.finish === null) ? (
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Chưa có ai về 0 bi.
                  </p>
                ) : (
                  <ol className="list-decimal pl-5 text-[11px] sm:text-xs space-y-1">
                    {ranking.map((r) => (
                      <li key={r.index}>
                        <span className="font-semibold">{r.name}</span>{" "}
                        {r.finish !== null ? (
                          <>
                            — về 0 ở ván{" "}
                            <span className="text-emerald-300 font-semibold">
                              {r.finish}
                            </span>
                          </>
                        ) : (
                          <>
                            — còn{" "}
                            <span className="font-semibold">
                              {r.remain < 0 ? 0 : r.remain} bi
                            </span>
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <p className="text-[11px] sm:text-xs text-slate-400">
                Gợi ý: có thể thêm luật phụ (ví dụ: ai về 0 trước nhưng âm quá sâu phải
                “chốt ván”, hoặc cộng/trừ thêm tiền theo từng foul trong ghi chú) tuỳ
                nhóm tự thống nhất.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
