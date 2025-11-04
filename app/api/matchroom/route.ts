import { NextResponse } from "next/server";

export const revalidate = 3600; // cache 1h on the server

export async function GET() {
  try {
    const res = await fetch("https://matchroompool.com/schedule/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BiaHelper/1.0; +https://example.com)",
      },
      // next: { revalidate: 3600 }
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `Upstream ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    return NextResponse.json({ ok: true, html });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
