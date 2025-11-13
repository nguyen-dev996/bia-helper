export type Keo = {
  slug: string;
  name: string;
  category: "pool" | "carom" | "keodo"; // Đưa Tá lả vào "keodo", bỏ hẳn nhóm "other"
  summary: string;
  notes?: string[];
  // Flow cấu hình UI/logic cho mọi kèo
  flow: "per-rack";       // chuẩn hoá flow 3 bước
  maxPlayers?: number;    // số người tối đa (mặc định 5)
  // Giữ fields để có thể thêm stake/option nếu cần; tối giản để UI không rối
  fields: Array<{
    key: string;
    label: string;
    type: "number" | "text" | "select";
    min?: number;
    options?: string[];
    placeholder?: string;
  }>;
};

export type Category = "pool" | "carom" | "keodo";

export const KEOS: Keo[] = [
  {
    slug: "pool-chap-game",
    name: "Pool — Chấp game (Race)",
    category: "pool",
    summary:
      "Flow per-rack: thêm người chơi, nhập người thắng từng ván; lịch sử hiển thị dạng bảng.",
    notes: [
      "Thống nhất breaker, alternate break, call-shot (10-ball), golden break trước khi chơi.",
    ],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [
      { key: "stake", label: "Stake giả lập (VND/ván)", type: "number", min: 0 },
    ],
  },
  {
    slug: "per-rack",
    name: "Per-rack — Tính chênh theo ván",
    category: "pool",
    summary:
      "Chuẩn per-rack: chọn người thắng theo từng ván; tính tổng ván thắng/mức chênh (giả lập).",
    flow: "per-rack",
    maxPlayers: 5,
    fields: [
      { key: "stake", label: "Stake giả lập (VND/ván)", type: "number", min: 0 },
    ],
  },
  {
    slug: "carom-chap-diem-co",
    name: "Carom — Chấp điểm / Chấp cơ",
    category: "carom",
    summary:
      "Áp dụng flow per-rack để ghi nhanh kết quả ván. (Gợi ý chấp điểm/cơ ghi ở ghi chú.)",
    notes: [
      "A chấp B h điểm ⇒ mục tiêu B = chuẩn + h; chấp cơ là giới hạn lượt cơ (tuỳ thoả thuận).",
    ],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [
      { key: "stake", label: "Stake giả lập (VND/ván)", type: "number", min: 0 },
    ],
  },

  // ---- Các thể loại Pool phổ biến (đều dùng flow per-rack) ---- //
  {
    slug: "pool-8-ball",
    name: "8-Ball Pool — Classic Bar Rules",
    category: "pool",
    summary:
      "Chia nhóm 1–7 và 9–15; ai dọn hết nhóm của mình rồi ghi bi 8 đúng luật là thắng.",
    notes: [
      "Golden break bi 8 (tuỳ luật bàn).",
      "Foul khi ghi bi 8 sai lỗ hoặc cùng bi trắng.",
    ],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [{ key: "stake", label: "Stake mỗi ván", type: "number", min: 0 }],
  },
  {
    slug: "pool-9-ball",
    name: "9-Ball Pool — Rotation Game",
    category: "pool",
    summary: "Đánh chạm bi nhỏ nhất trước; ghi bi 9 hợp lệ là thắng ván.",
    notes: ["Cho phép combo hợp lệ vào bi 9."],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [{ key: "stake", label: "Stake mỗi ván", type: "number", min: 0 }],
  },
  {
    slug: "pool-10-ball",
    name: "10-Ball Pool — Call-shot format",
    category: "pool",
    summary: "Giống 9-ball nhưng phải call-shot bi 10, yêu cầu chính xác hơn.",
    notes: ["Phải chạm bi nhỏ nhất; sai lỗ = mất lượt."],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [{ key: "stake", label: "Stake mỗi ván", type: "number", min: 0 }],
  },
  {
    slug: "pool-straight-14-1",
    name: "14.1 Continuous (Straight Pool)",
    category: "pool",
    summary: "Mỗi bi = 1 điểm; khi còn 1 bi thì rack lại 14 bi còn lại.",
    notes: ["Lỗi = trừ điểm; phải ghi 1 bi hoặc chạm 2 băng."],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [{ key: "stake", label: "Stake mỗi ván", type: "number", min: 0 }],
  },
  {
    slug: "pool-one-pocket",
    name: "One-Pocket",
    category: "pool",
    summary: "Mỗi người một lỗ; ai ghi đủ 8 bi vào lỗ của mình trước là thắng.",
    notes: ["Thiên về chiến thuật, phòng thủ."],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [{ key: "stake", label: "Stake mỗi ván", type: "number", min: 0 }],
  },
  {
    slug: "pool-banks",
    name: "Banks Pool",
    category: "pool",
    summary: "Chỉ tính bi đi băng trước khi vào lỗ; thường phải call-shot.",
    notes: ["Mỗi bi = 1 điểm; ai đủ 5 bi trước là thắng."],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [{ key: "stake", label: "Stake mỗi ván", type: "number", min: 0 }],
  },
  {
    slug: "pool-rotation",
    name: "Rotation (61-point game)",
    category: "pool",
    summary: "Tổng điểm theo số trên bi; đạt ≥61 điểm trước là thắng.",
    notes: ["Phải chạm bi nhỏ nhất trước."],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [{ key: "stake", label: "Stake mỗi ván", type: "number", min: 0 }],
  },
  {
    slug: "pool-cutthroat",
    name: "Cutthroat (3-player game)",
    category: "pool",
    summary: "3 người; ai còn bi cuối trên bàn là thắng.",
    notes: ["Nhóm bi: 1–5, 6–10, 11–15 (thường dùng)."],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [{ key: "stake", label: "Stake mỗi ván", type: "number", min: 0 }],
  },

  // ---- Kèo Độ (keodo) ---- //
  {
    slug: "ta-la",
    flow: "per-rack",
    name: "Tá lả (tính lá thua)",
    category: "keodo", // ⬅️ Đã đưa Tá lả vào nhóm Kèo Độ
    summary:
      "Kèo độ kiểu tá lả: nhập lá thua cho N-1 người, người còn lại thắng = tổng lá của tất cả người thua.",
    notes: [
      "Tối đa 5 người chơi",
      "Cấu hình tiền/1 lá thua",
      "Mỗi ván: để trống 1 người (người thắng)",
    ],
    fields: [
      {
        key: "players",
        label: "Danh sách người chơi",
        type: "text",
        placeholder: "Nhập tối đa 5 tên, cách nhau bằng dấu phẩy",
      },
      {
        key: "unit",
        label: "Tiền / 1 lá thua",
        type: "number",
        min: 0,
        placeholder: "VD: 5000",
      },
    ],
  },

  // ⭐ NEW: 99 bi đền (kèo độ) ⭐
  {
    slug: "99-bi-den",
    flow: "per-rack",
    name: "99 bi đền",
    category: "keodo",
    summary:
      "Kèo 99 bi đền: mỗi lỗi bị trừ/đền bi; ai chạm mốc đền (ví dụ 99 bi) thì thua nặng nhất. Có thể áp dụng cho 8-ball/9-ball tuỳ bàn.",
    notes: [
      "Cấu hình tiền/1 bi đền (VD: 1k/bi, 2k/bi...).",
      "Có thể chọn mốc đền khác (ví dụ 50, 99, 199 tuỳ độ 'thơm').",
      "Flow UI: ghi số bi đền của từng người sau mỗi ván / mỗi lượt, cuối buổi tính tổng tiền.",
    ],
    maxPlayers: 5,
    fields: [
      {
        key: "players",
        label: "Danh sách người chơi",
        type: "text",
        placeholder: "Nhập tối đa 5 tên, cách nhau bằng dấu phẩy",
      },
      {
        key: "unit",
        label: "Tiền / 1 bi đền",
        type: "number",
        min: 0,
        placeholder: "VD: 1000",
      },
      {
        key: "maxFine",
        label: "Mốc bi đền (tuỳ chọn)",
        type: "number",
        min: 1,
        placeholder: "VD: 99 (0 = không giới hạn)",
      },
    ],
  },

  // ---- Kèo Độ (keodo) bổ sung ---- //
  {
    slug: "keodo-gac-co",
    name: "Độ theo gác cơ (thắng giữ cơ)",
    category: "keodo",
    summary:
      "Ai thắng giữ cơ đánh tiếp; thua phải nhường cơ. Tiền thắng tăng theo chuỗi thắng liên tiếp (ví dụ +10k theo cấp số).",
    notes: [
      "Mỗi ván lưu người thắng; hệ thống tự tính chuỗi thắng (streak).",
      "Tiền một ván = baseStake nếu streak=1; nếu chọn 'cấp số cộng' → baseStake + (streak-1)*step; nếu 'cấp số nhân' → baseStake * (multiplier)^(streak-1).",
      "Chuỗi thắng reset khi người đó thua.",
    ],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [
      {
        key: "baseStake",
        label: "Tiền nền (VND/ván)",
        type: "number",
        min: 0,
        placeholder: "VD: 10000",
      },
      {
        key: "progression",
        label: "Kiểu tăng tiền",
        type: "select",
        options: ["cấp số cộng", "cấp số nhân"],
      },
      {
        key: "step",
        label: "Bước tăng (+VND/ván) (nếu cộng)",
        type: "number",
        min: 0,
        placeholder: "VD: 10000",
      },
      {
        key: "multiplier",
        label: "Hệ số nhân (nếu nhân)",
        type: "number",
        min: 1,
        placeholder: "VD: 2",
      },
      {
        key: "streakCap",
        label: "Giới hạn chuỗi (tuỳ chọn)",
        type: "number",
        min: 0,
        placeholder: "0 = không giới hạn",
      },
    ],
  },
  {
    slug: "keodo-time",
    name: "Độ theo thời gian (công tơ/giờ chơi)",
    category: "keodo",
    summary:
      "Dành cho nhóm chơi lâu: chia đều chi phí giờ bàn, cuối buổi cộng/trừ độ theo kết quả tổng.",
    notes: [
      "Nhập tổng thời gian, đơn giá/giờ; hệ thống chia đều 'phí bàn' cho mỗi người.",
      "Trong buổi có thể vẫn ghi per-rack người thắng để tính độ; cuối buổi = (độ thắng/thua) ± phần phí bàn.",
    ],
    flow: "per-rack",
    maxPlayers: 5,
    fields: [
      {
        key: "hourlyRate",
        label: "Đơn giá giờ bàn (VND/giờ)",
        type: "number",
        min: 0,
        placeholder: "VD: 120000",
      },
      {
        key: "durationMin",
        label: "Thời lượng buổi (phút)",
        type: "number",
        min: 0,
        placeholder: "VD: 90",
      },
      {
        key: "split",
        label: "Cách chia phí bàn",
        type: "select",
        options: ["chia đều"],
      },
      {
        key: "stake",
        label: "Stake giả lập per-rack (tuỳ chọn)",
        type: "number",
        min: 0,
        placeholder: "VD: 5000",
      },
    ],
  },
];

export function getKeoBySlug(slug: string) {
  return KEOS.find((k) => k.slug === slug);
}

export function groupByCategory(list: Keo[] = KEOS) {
  const groups: Record<Category, Keo[]> = { pool: [], carom: [], keodo: [] };
  for (const k of list) {
    if (k.category === "pool") groups.pool.push(k);
    else if (k.category === "carom") groups.carom.push(k);
    else groups.keodo.push(k); // không còn nhóm other
  }
  return groups;
}
