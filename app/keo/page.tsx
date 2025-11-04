"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { KEOS, groupByCategory, type Category, type Keo } from "@/lib/keodata";

export default function KeoListPage() {
  const [active, setActive] = useState<Category>("pool");

  const groups = useMemo(() => groupByCategory(KEOS), []);
  const tabs: { key: Category; label: string }[] = [
    { key: "pool", label: "Pool" },
    { key: "carom", label: "Carom" },
    { key: "keodo", label: "Kèo Độ" }, // ⬅️ không còn nhóm other
  ];

  const items: Keo[] = useMemo(() => {
    const list = groups[active] || [];
    // Đảm bảo /ta-la được đưa đúng nhóm keodo và ưu tiên hiển thị đầu danh sách
    if (active === "keodo") {
      const taLa = list.find((k) => k.slug === "ta-la");
      const others = list.filter((k) => k.slug !== "ta-la");
      return taLa ? [taLa, ...others] : list;
    }
    return list;
  }, [groups, active]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl p-4">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Danh sách kèo</h1>
            <p className="text-sm text-slate-400">Chọn thể loại để xem kèo và vào chi tiết.</p>
          </div>
          <Link
            href="/"
            className="text-sm text-cyan-300 hover:text-white underline decoration-dotted"
          >
            ← Trang chủ
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={[
                "px-3 py-1.5 rounded-full text-sm border transition",
                active === t.key
                  ? "bg-white text-slate-900 border-white"
                  : "bg-white/5 text-slate-200 border-white/15 hover:bg-white/10",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((k) => (
            <Link
              key={k.slug}
              href={k.slug === "ta-la" ? "/keo/ta-la" : `/keo/${k.slug}`}
              className="block rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {k.name}
                    {k.slug === "ta-la" && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-200 border border-emerald-400/30">
                        Tá lả
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-300 mt-1 line-clamp-3">{k.summary}</p>
                </div>
              </div>
              {k.notes?.length ? (
                <ul className="mt-2 text-xs text-slate-400 list-disc pl-5 space-y-0.5">
                  {k.notes.slice(0, 3).map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              ) : null}
            </Link>
          ))}

          {items.length === 0 && (
            <div className="col-span-full text-slate-400 text-sm">
              Chưa có kèo trong mục này.
            </div>
          )}
        </section>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          <span className="opacity-60">Lối tắt:</span>
          <Link href="/keo/ta-la" className="underline decoration-dotted hover:text-white">
            Tá lả
          </Link>
          <span className="opacity-40">•</span>
          <Link href="/faq" className="underline decoration-dotted hover:text-white">
            FAQ
          </Link>
        </div>

        <footer className="text-xs text-slate-400 mt-6">
          © 2025 • Bi‑a Helper — Educational only.
        </footer>
      </div>
    </main>
  );
}
