"use client";

import { useEffect, useState } from "react";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function Timestamp({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => timeAgo(iso));

  useEffect(() => {
    const interval = setInterval(() => setLabel(timeAgo(iso)), 5000);
    return () => clearInterval(interval);
  }, [iso]);

  return (
    <p className="text-center text-xs text-neutral-600">
      Analyzed {label}
    </p>
  );
}
