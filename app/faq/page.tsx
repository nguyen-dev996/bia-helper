"use client";
import Link from "next/link";

export default function FAQPage() {
  const faqs = [
    {
      q: "Bi-a có mấy thể loại phổ biến?",
      a: "Phổ biến nhất gồm Pool (8-ball, 9-ball, 10-ball), Carom (Libre, 1 băng, 3 băng), và Snooker." ,
    },
    {
      q: "Chấp game và chấp điểm khác nhau thế nào?",
      a: "Chấp game thường áp dụng cho Pool (A cho B +g game trong race). Chấp điểm áp dụng cho Carom, cộng thêm vào điểm mục tiêu của B." ,
    },
    {
      q: "Per-rack là gì?",
      a: "Per-rack nghĩa là tính tiền từng ván. Sau mỗi ván thắng/thua sẽ thanh toán ngay theo đơn vị đã thỏa thuận (ví dụ 10k/ván)." ,
    },
    {
      q: "Per-match khác per-rack ra sao?",
      a: "Per-match chỉ tính khi kết thúc set hoặc match theo tỉ số chung. Per-rack tính từng ván ngay sau khi kết thúc." ,
    },
    {
      q: "Golden break là gì?",
      a: "Khi người giao bóng đẩy bi 9 hoặc 10 vào lỗ ở cú break đầu tiên, một số nơi tính là thắng luôn ván đó. Tuy nhiên nên thỏa thuận trước khi chơi." ,
    },
    {
      q: "Có quy định nào về alternate break không?",
      a: "Alternate break (luân phiên giao bóng) là cách phổ biến để đảm bảo công bằng, thay vì 1 người giao toàn bộ." ,
    },
    {
      q: "Carom chấp cơ nghĩa là gì?",
      a: "Chấp cơ là giới hạn số lượt cơ tối đa cho người mạnh hơn (ví dụ 30 điểm trong 25 cơ). Nếu hết cơ mà chưa đạt điểm thì thua." ,
    },
    {
      q: "Tại sao nên xác định handicap trước khi chơi?",
      a: "Vì giúp tránh tranh cãi và giữ công bằng giữa các trình độ khác nhau. Handicap có thể dựa vào trình, tỉ lệ thắng, hoặc thỏa thuận riêng." ,
    },
    {
      q: "Kèo Tá lả là gì?",
      a: "Là dạng kèo tính bằng số lá thua của từng người, người thắng nhận tổng lá thua của những người còn lại. Thường áp dụng trong bi-a độ vui." ,
    },
    {
      q: "Có nên cá cược tiền thật trong bi-a không?",
      a: "Không khuyến khích. Các công cụ ở đây chỉ phục vụ mục đích học thuật, vui chơi và mô phỏng giả lập, tuân thủ pháp luật địa phương." ,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-4xl p-4">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Câu hỏi thường gặp (FAQ)</h1>
          <Link href="/" className="text-sm text-cyan-300 hover:text-white underline decoration-dotted">
            ← Trang chủ
          </Link>
        </header>

        <section className="space-y-3">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-slate-800/40 p-4 hover:bg-slate-800/60 transition"
            >
              <h3 className="font-semibold text-lg text-white mb-1">
                {i + 1}. {item.q}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </section>

        <footer className="text-xs text-slate-400 mt-6">
          © 2025 • Bi-a Helper — Educational only.
        </footer>
      </div>
    </main>
  );
}