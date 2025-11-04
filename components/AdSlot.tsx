"use client";

import { useEffect } from "react";

type Props = {
  slot?: string;                 // data-ad-slot của ad unit
  style?: React.CSSProperties;
  className?: string;
  layoutKey?: string;            // ép re-init khi route thay đổi (optional)
};

export default function AdSlot({ slot, style, className, layoutKey }: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // ví dụ: "ca-pub-XXXXXXXXXXXXXXX"
  const canShow = !!client && !!slot;

  useEffect(() => {
    if (!canShow) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [canShow, layoutKey]);

  if (!canShow) return null;

  return (
    <ins
      className={`adsbygoogle ${className || ""}`}
      style={style || { display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
