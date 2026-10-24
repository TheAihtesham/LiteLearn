"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = {
  id: string; title: string; subject: string;
  original: number; low: number; audio: number;
  saved: number; percent: number; measured: boolean;
};
type Stats = {
  lessonCount: number; totalOriginal: number; totalLow: number;
  saved: number; percent: number; rows: Row[];
};

const size = (b: number) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStats)
      .catch(() => setError("Could not load the numbers. Check your MongoDB connection."));
  }, []);

  if (error) return <p className="text-red-700">{error}</p>;
  if (!stats) return <p>Loading numbers…</p>;

  const cards = [
    { label: "Lessons", value: String(stats.lessonCount) },
    { label: "Original size", value: size(stats.totalOriginal) },
    { label: "Low-data size", value: size(stats.totalLow) },
    { label: "Data saved", value: `${size(stats.saved)} (${stats.percent}%)`, highlight: true },
  ];

  return (
    <div>
      <h1 className="display text-3xl font-semibold">Data saved</h1>
      <p className="mt-2 max-w-prose text-[#3d4f4a]">
        Sizes reported by Cloudinary for each lesson. Savings assume a student watches the Low (240p) version instead of the original.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded border p-4 ${c.highlight ? "border-[#e8b23a] bg-[#e8b23a]/25" : "border-[#17302b]/20 bg-white"}`}>
            <dt className="text-sm text-[#3d4f4a]">{c.label}</dt>
            <dd className="display mt-1 text-xl font-semibold">{c.value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="display mt-10 text-2xl font-semibold">Per lesson</h2>
      {stats.rows.length === 0 && (
        <p className="mt-3">No lessons yet. <Link href="/teacher" className="underline">Upload one.</Link></p>
      )}

      <ul className="mt-4 space-y-5">
        {stats.rows.map((r) => (
          <li key={r.id}>
            <div className="flex items-baseline justify-between gap-3">
              <Link href={`/lesson/${r.id}`} className="font-medium underline-offset-2 hover:underline">{r.title}</Link>
              <span className="text-sm text-[#3d4f4a]">{r.measured ? `${r.percent}% smaller` : "sizes not available"}</span>
            </div>
            {r.measured && (
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-20">Original</span>
                  <div className="h-3 flex-1 rounded bg-[#17302b]/25" />
                  <span className="w-16 text-right">{size(r.original)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20">Low data</span>
                  <div className="h-3 flex-1 rounded bg-[#17302b]/10">
                    <div className="h-3 rounded bg-[#17302b]" style={{ width: `${Math.max(2, 100 - r.percent)}%` }} />
                  </div>
                  <span className="w-16 text-right">{size(r.low)}</span>
                </div>
                {r.audio > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-20">Audio only</span>
                    <div className="h-3 flex-1 rounded bg-[#17302b]/10">
                      <div className="h-3 rounded bg-[#e8b23a]" style={{ width: `${Math.max(2, Math.round((r.audio / r.original) * 100))}%` }} />
                    </div>
                    <span className="w-16 text-right">{size(r.audio)}</span>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}