import "./globals.css";
import type { ReactNode } from "react";
import Script from "next/script";
import AdSlot from "@/components/AdSlot";

export const metadata = { title: "Bi-a Helper", description: "Educational only" };

export default function RootLayout({ children }: { children: ReactNode }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // ví dụ: "ca-pub-XXXXXXXXXXXXXXX"

  // Khuyến nghị set bằng env:
  const LEFT_SLOT_1  = process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT_1;   // "1234567890"
  const LEFT_SLOT_2  = process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT_2;   // ""
  const RIGHT_SLOT_1 = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RIGHT_1;  // ""
  const RIGHT_SLOT_2 = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RIGHT_2;  // ""

  const hasClient = !!client;
  const hasAnySlot = [LEFT_SLOT_1, LEFT_SLOT_2, RIGHT_SLOT_1, RIGHT_SLOT_2].some(Boolean);
  const showAds = hasClient && hasAnySlot;

  return (
    <html lang="vi">
      <head>
        {/* Chỉ nạp script nếu có client */}
        {hasClient && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <div className="min-h-screen bg-slate-900 text-slate-100">
          <div
            className="
              mx-auto
              grid
              grid-cols-1
              lg:grid-cols-[minmax(0,1fr)_minmax(0,900px)_minmax(0,1fr)]
              gap-4
              px-2 sm:px-4 lg:px-6
            "
          >
            {/* Left rail: chỉ render khi showAds === true */}
            {showAds ? (
              <aside className="hidden lg:block">
                <div className="sticky top-4 space-y-4">
                  <AdSlot slot={LEFT_SLOT_1 || undefined} style={{ display: "block", minHeight: 0 }} />
                  <AdSlot slot={LEFT_SLOT_2 || undefined} style={{ display: "block", minHeight: 0 }} />
                </div>
              </aside>
            ) : (
              <div className="hidden lg:block" /> // giữ lưới cân nếu muốn; hoặc bỏ hẳn để giãn giữa
            )}

            {/* Main */}
            <main className="min-h-screen">{children}</main>

            {/* Right rail */}
            {showAds ? (
              <aside className="hidden lg:block">
                <div className="sticky top-4 space-y-4">
                  <AdSlot slot={RIGHT_SLOT_1 || undefined} style={{ display: "block", minHeight: 0 }} />
                  <AdSlot slot={RIGHT_SLOT_2 || undefined} style={{ display: "block", minHeight: 0 }} />
                </div>
              </aside>
            ) : (
              <div className="hidden lg:block" />
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
