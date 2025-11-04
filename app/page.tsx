"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";

// =====================
// i18n
// =====================

type Lang = "vi" | "en";
const dict: Record<Lang, Record<string, string>> = {
  vi: {
    title: "Bi‑a — Rule & Handicap Helper",
    disclaimer:
      "Công cụ này chỉ nhằm mục đích học thuật/giải trí. Không khuyến khích hay hỗ trợ cá cược tiền thật. Vui lòng tuân thủ pháp luật địa phương.",
    pool: "Pool (8‑ball / 9‑ball / 10‑ball) — Chấp game",
    carom: "Carom (Libre/1‑băng/3‑băng) — Chấp điểm / Chấp cơ",
    perRack: "Per‑rack — Mô phỏng theo số ván",
    raceTo: "Race to (chuẩn)",
    handicap: "Handicap (A chấp B … game)",
    stakeMatch: "Tiền mỗi match (VND) — giả lập",
    stakeRack: "Tiền mỗi ván (VND) — giả lập",
    racks: "Số ván dự kiến",
    aWins: "Ván thắng của A",
    bWins: "Ván thắng của B",
    targetPts: "Điểm mục tiêu chuẩn",
    ptsHandicap: "Chấp điểm: A chấp B",
    inningsA: "Giới hạn cơ cho A (tuỳ thỏa thuận)",
    inningsB: "Giới hạn cơ cho B (tuỳ thỏa thuận)",
    odds: "Tỷ lệ (ví dụ 1.5 ⇒ thua trả 1.5×)",
    saveRun: "Lưu phiên này",
    reset: "Xóa cấu hình",
    language: "Ngôn ngữ",
    poolGoal: "Mục tiêu",
    notesPool:
      "Gợi ý: thống nhất breaker, alternate break, call‑shot (10‑ball), golden break… trước khi chơi.",
    notesCarom:
      "Thông lệ: nếu A chấp B h điểm ⇒ mục tiêu B = chuẩn + h. Chấp cơ là giới hạn số lượt cơ.",
    diff: "Chênh lệch giả lập (dương A có lợi, âm B có lợi)",
    // VN snapshot
    vnHeading: "Kèo độ phổ biến tại Việt Nam",
    vnIntro:
      "Tổng hợp nhanh những kèo hay gặp ở bàn bi‑a Việt Nam. Chỉ dùng để tham khảo và làm rõ quy ước trước khi vào kèo.",
    vnTypes: "Các kèo thường gặp",
    vnTerms: "Thuật ngữ nhanh",
    vnEtiquette: "Quy ước & tác phong",
    vnMoney: "Đơn vị & ví dụ cược",
    vnCtaTala: "Dụng cụ tính kèo Tá lả →",
    vnChip_pool_game: "9‑bi chấp game",
    vnChip_pool_race: "Race to (chạy tỉ số)",
    vnChip_pool_spot: "Đền bi / Spot ball",
    vnChip_carom_pts: "Carom chấp điểm",
    vnChip_carom_inn: "Carom chấp cơ",
    vnChip_perrack: "Tính tiền theo ván",
    vnChip_tala: "Tá lả (tính theo lá)",
    term_altBreak: "Alternate break: luân phiên giao bóng",
    term_call10: "10‑ball call‑shot: phải báo lỗ",
    term_goldBreak: "Golden break: 9/10 vào lỗ đầu được tính?",
    term_spot: "Đền bi: bi mục tiêu rơi sai luật phải đặt lại?",
    etq_1: "Thoả thuận rõ handicap (game/điểm/cơ) và điều kiện thắng.",
    etq_2: "Chốt mức cược, đơn vị (VND/k), cách làm tròn.",
    etq_3: "Quy ước foul, rào chắn (3‑foul), jump/masse, rút cơ…",
    money_tip: "Ví dụ: per‑rack 10k; race‑to 7, A chấp B 2 game ⇒ B chạy 9.",
    faq: "FAQ nhanh",
    faq1_q: "‘Chấp game’ khác ‘chấp điểm’ thế nào?",
    faq1_a:
      "Chấp game dùng cho Pool: A cho B +g game vào mục tiêu Race. Chấp điểm thường dùng cho Carom: cộng thêm điểm vào mục tiêu của B.",
    faq2_q: "Per‑rack và per‑match tính ra sao?",
    faq2_a:
      "Per‑rack: mỗi ván thanh toán ngay theo chênh lệch ván. Per‑match: chỉ tính khi kết thúc set theo tỉ số chung.",
  },
  en: {
    title: "Billiards — Rule & Handicap Helper",
    disclaimer:
      "This tool is for educational/entertainment purposes only. It does NOT encourage or facilitate real‑money gambling. Obey local laws.",
    pool: "Pool (8‑ball / 9‑ball / 10‑ball) — Game handicap",
    carom: "Carom (Libre/1‑cushion/3‑cushion) — Point/Inning handicap",
    perRack: "Per‑rack — Racks simulation",
    raceTo: "Race to (base)",
    handicap: "Handicap (A gives B … games)",
    stakeMatch: "Stake per match (VND) — mock",
    stakeRack: "Stake per rack (VND) — mock",
    racks: "Planned racks",
    aWins: "A wins",
    bWins: "B wins",
    targetPts: "Target points (base)",
    ptsHandicap: "Point handicap: A → B",
    inningsA: "Innings cap for A (optional)",
    inningsB: "Innings cap for B (optional)",
    odds: "Odds (e.g. 1.5 ⇒ loser pays 1.5×)",
    saveRun: "Save this run",
    reset: "Reset",
    language: "Language",
    poolGoal: "Goals",
    notesPool:
      "Tip: agree on breaker, alternate break, call‑shot (10‑ball), golden break, etc.",
    notesCarom:
      "Common: if A gives B h points ⇒ B's target = base + h. Inning cap limits turns.",
    diff: "Net mock difference (positive = A advantage, negative = B)",
    // VN snapshot (EN captions)
    vnHeading: "Popular Vietnamese ‘kèo’ (informal handicaps)",
    vnIntro:
      "A quick cheat‑sheet of common table deals in Vietnam. Use to align rules/handicaps before playing.",
    vnTypes: "Common deals",
    vnTerms: "Quick terms",
    vnEtiquette: "Table etiquette",
    vnMoney: "Units & stake examples",
    vnCtaTala: "Open Tá lả calculator →",
    vnChip_pool_game: "9‑ball game handicap",
    vnChip_pool_race: "Race‑to (target)",
    vnChip_pool_spot: "Spot ball / penalty",
    vnChip_carom_pts: "Carom point handicap",
    vnChip_carom_inn: "Carom inning cap",
    vnChip_perrack: "Per‑rack settlement",
    vnChip_tala: "Tá lả (leaf‑count)",
    term_altBreak: "Alternate break",
    term_call10: "10‑ball call‑shot",
    term_goldBreak: "Golden break on 9/10?",
    term_spot: "Spotting on fouls?",
    etq_1: "Clarify handicap and win condition before starting.",
    etq_2: "Fix stake & unit (VND/k), rounding method.",
    etq_3: "Agree on fouls, 3‑foul rule, jump/masse policy.",
    money_tip:
      "Example: per‑rack 10k; race‑to 7, A gives B +2 ⇒ B's target = 9.",
    faq: "Quick FAQ",
    faq1_q: "Game vs point handicap?",
    faq1_a:
      "Game handicap for Pool adjusts the race target. Point handicap for Carom adds to B's target score.",
    faq2_q: "Per‑rack vs per‑match?",
    faq2_a:
      "Per‑rack settles every rack; per‑match settles after the whole set.",
  },
};

// =====================
// Hooks & utils
// =====================

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial as T;
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : initial;
    } catch {
      return initial as T;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

const currencyVND = (n: number) =>
  isFinite(n)
    ? n.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      })
    : "—";

// =====================
// Page component
// =====================

export default function Page() {
  const [lang, setLang] = useLocalStorage<Lang>("bia_lang", "vi");
  const t = useMemo(() => dict[lang], [lang]);
  // Pool
  const [poolType, setPoolType] = useLocalStorage("poolType", "9");
  const [raceTo, setRaceTo] = useLocalStorage<number>("raceTo", 7);
  const [poolHandicap, setPoolHandicap] = useLocalStorage<number>(
    "poolHandicap",
    2
  );
  const [poolStake, setPoolStake] = useLocalStorage<number>(
    "poolStake",
    50000
  );
  // Per‑rack
  const [rackStake, setRackStake] = useLocalStorage<number>(
    "rackStake",
    10000
  );
  const [rackCount, setRackCount] = useLocalStorage<number>(
    "rackCount",
    15
  );
  const [rackA, setRackA] = useLocalStorage<number>("rackA", 8);
  const [rackB, setRackB] = useLocalStorage<number>("rackB", 7);
  // Carom
  const [caromTarget, setCaromTarget] = useLocalStorage<number>(
    "caromTarget",
    30
  );
  const [caromHandicapPts, setCaromHandicapPts] = useLocalStorage<number>(
    "caromHandicapPts",
    5
  );
  const [caromInningsA, setCaromInningsA] = useLocalStorage<number>(
    "caromInningsA",
    0
  );
  const [caromInningsB, setCaromInningsB] = useLocalStorage<number>(
    "caromInningsB",
    0
  );
  const [caromStake, setCaromStake] = useLocalStorage<number>(
    "caromStake",
    50000
  );
  const [caromOdds, setCaromOdds] = useLocalStorage<number>("caromOdds", 1);

  const rackDiff = rackA - rackB;
  const rackNet = rackDiff * rackStake;

  const saveRun = () => {
    const snap = {
      ts: Date.now(),
      pool: { poolType, raceTo, h: poolHandicap, stake: poolStake },
      rack: { stake: rackStake, count: rackCount, a: rackA, b: rackB },
      carom: {
        target: caromTarget,
        h: caromHandicapPts,
        innA: caromInningsA,
        innB: caromInningsB,
        stake: caromStake,
        odds: caromOdds,
      },
    };
    try {
      const prev = JSON.parse(localStorage.getItem("bia_history") || "[]");
      localStorage.setItem(
        "bia_history",
        JSON.stringify([snap, ...prev].slice(0, 50))
      );
    } catch {}
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl p-4">
        {/* Header */}
        <header className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 grid place-items-center text-slate-900 font-black">
            BA
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-bold leading-tight">
              {t.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-400">{t.disclaimer}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">{t.language}</label>
            <select
              className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </header>

        {/* Global menu */}
        <nav className="mb-4">
          <div className="flex flex-wrap gap-2">
            <Link href="/keo" className="px-3 py-1.5 rounded-full text-sm border border-white/15 bg-white/5 hover:bg-white/10">Danh sách kèo</Link>
            <Link href="/lich" className="px-3 py-1.5 rounded-full text-sm border border-white/15 bg-white/5 hover:bg-white/10">Lịch thi đấu</Link>
            <Link href="/faq" className="px-3 py-1.5 rounded-full text-sm border border-white/15 bg-white/5 hover:bg-white/10">FAQ</Link>
          </div>
        </nav>

        {/* Vietnam snapshot / cheat‑sheet */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-semibold">
                {t.vnHeading}
              </h2>
              <p className="text-sm text-slate-400">{t.vnIntro}</p>
            </div>
            <Link
              href="/keo/ta-la"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-900 font-semibold hover:opacity-90"
            >
              {t.vnCtaTala}
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-3 mt-3">
            {/* Types */}
            <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3">
              <h3 className="font-semibold mb-2">{t.vnTypes}</h3>
              <div className="flex flex-wrap gap-2">
                {[t.vnChip_pool_game, t.vnChip_pool_race, t.vnChip_pool_spot, t.vnChip_carom_pts, t.vnChip_carom_inn, t.vnChip_perrack, t.vnChip_tala].map((label) => (
                  <span
                    key={label}
                    className="px-2 py-1 text-xs rounded-full border border-white/10 bg-white/5"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            {/* Terms */}
            <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3">
              <h3 className="font-semibold mb-2">{t.vnTerms}</h3>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• {t.term_altBreak}</li>
                <li>• {t.term_call10}</li>
                <li>• {t.term_goldBreak}</li>
                <li>• {t.term_spot}</li>
              </ul>
            </div>
            {/* Etiquette */}
            <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3">
              <h3 className="font-semibold mb-2">{t.vnEtiquette}</h3>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• {t.etq_1}</li>
                <li>• {t.etq_2}</li>
                <li>• {t.etq_3}</li>
              </ul>
            </div>
            {/* Money */}
            <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3">
              <h3 className="font-semibold mb-2">{t.vnMoney}</h3>
              <p className="text-sm text-slate-300">{t.money_tip}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-900/60 border border-white/10 p-2">
                  <div className="opacity-70">10k/rack × Δ=3</div>
                  <div className="font-semibold">{currencyVND(30000)}</div>
                </div>
                <div className="rounded-lg bg-slate-900/60 border border-white/10 p-2">
                  <div className="opacity-70">Per‑match 50k (mock)</div>
                  <div className="font-semibold">{currencyVND(50000)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pool & Per‑rack calculators */}
        <section className="grid md:grid-cols-2 gap-4">
          {/* Pool */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="font-semibold mb-2">{t.pool}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Type</label>
                <select
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                  value={poolType}
                  onChange={(e) => setPoolType(e.target.value)}
                >
                  <option value="9">9‑ball</option>
                  <option value="8">8‑ball</option>
                  <option value="10">10‑ball</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">{t.raceTo}</label>
                <input
                  type="number"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                  value={raceTo}
                  min={1}
                  onChange={(e) => setRaceTo(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">{t.handicap}</label>
                <input
                  type="number"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                  value={poolHandicap}
                  min={0}
                  onChange={(e) => setPoolHandicap(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">{t.stakeMatch}</label>
                <input
                  type="number"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                  value={poolStake}
                  min={0}
                  onChange={(e) => setPoolStake(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-slate-800 p-3 text-sm">
              <div>
                <span className="opacity-70">{t.poolGoal}:</span> A = <b>{raceTo}</b> | B = <b>{raceTo + poolHandicap}</b>
              </div>
              <div className="text-xs text-slate-400 mt-1">{t.notesPool}</div>
            </div>
          </div>

          {/* Per‑rack */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="font-semibold mb-2">{t.perRack}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">{t.stakeRack}</label>
                <input
                  type="number"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                  value={rackStake}
                  min={0}
                  onChange={(e) => setRackStake(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">{t.racks}</label>
                <input
                  type="number"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                  value={rackCount}
                  min={1}
                  onChange={(e) => setRackCount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">{t.aWins}</label>
                <input
                  type="number"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                  value={rackA}
                  min={0}
                  onChange={(e) => setRackA(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">{t.bWins}</label>
                <input
                  type="number"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                  value={rackB}
                  min={0}
                  onChange={(e) => setRackB(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-slate-800 p-3 text-sm">
              <div>
                Total racks: <b>{rackA + rackB}</b>/{rackCount} • Δ(A−B) = <b>{rackDiff}</b>
              </div>
              <div>
                {t.diff}: <b>{currencyVND(rackNet)}</b>
              </div>
            </div>
          </div>
        </section>

        {/* Carom */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-4">
          <h2 className="font-semibold mb-2">{t.carom}</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400">{t.targetPts}</label>
              <input
                type="number"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                value={caromTarget}
                min={5}
                onChange={(e) => setCaromTarget(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">{t.ptsHandicap}</label>
              <input
                type="number"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                value={caromHandicapPts}
                min={0}
                onChange={(e) => setCaromHandicapPts(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">{t.stakeMatch}</label>
              <input
                type="number"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                value={caromStake}
                min={0}
                onChange={(e) => setCaromStake(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">{t.inningsA}</label>
              <input
                type="number"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                value={caromInningsA}
                min={0}
                onChange={(e) => setCaromInningsA(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">{t.inningsB}</label>
              <input
                type="number"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                value={caromInningsB}
                min={0}
                onChange={(e) => setCaromInningsB(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">{t.odds}</label>
              <input
                type="number"
                step={0.1}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2"
                value={caromOdds}
                min={0}
                onChange={(e) => setCaromOdds(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-slate-800 p-3 text-sm">
            <div>
              Goals: A = <b>{caromTarget}</b> | B = <b>{caromTarget + caromHandicapPts}</b>
            </div>
            <div className="text-xs text-slate-400 mt-1">{t.notesCarom}</div>
          </div>
        </section>

        {/* Actions */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={saveRun}
              className="px-4 py-2 rounded-xl font-semibold bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-900"
            >
              {t.saveRun}
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                location.reload();
              }}
              className="px-4 py-2 rounded-xl font-semibold border border-white/20"
            >
              {t.reset}
            </button>
            <Link
              href="/keo/ta-la"
              className="ml-auto text-sm text-cyan-300 hover:text-white underline decoration-dotted"
            >
              {t.vnCtaTala}
            </Link>
          </div>
        </section>

        {/* FAQ quick */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 mt-4">
          <h2 className="font-semibold mb-2">{t.faq}</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-300">
            <div className="rounded-xl bg-slate-800/40 border border-white/10 p-3">
              <div className="font-semibold text-slate-100">{t.faq1_q}</div>
              <div className="mt-1">{t.faq1_a}</div>
            </div>
            <div className="rounded-xl bg-slate-800/40 border border-white/10 p-3">
              <div className="font-semibold text-slate-100">{t.faq2_q}</div>
              <div className="mt-1">{t.faq2_a}</div>
            </div>
          </div>
        </section>

        <footer className="text-xs text-slate-400 mt-6">
          © 2025 • Bi‑a Helper — Educational only. Không khuyến khích/không hỗ trợ cá cược bằng tiền thật.
        </footer>
      </div>
    </main>
  );
}
