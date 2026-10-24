"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lesson = {
  _id: string;
  title: string;
  subject: string;
  duration?: number;
  originalBytes?: number;
  snapshots?: string[];
  versions: { key: string; bytes?: number }[];
};
type Stats = { lessonCount: number; saved: number };

const size = (b?: number) =>
  !b ? "size unknown" : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

const clock = (s?: number) => {
  if (!s) return "";
  const total = Math.round(s);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

// The saved board photo is 1280px wide. Ask Cloudinary for a small copy for cards.
const thumb = (src?: string) => src?.replace("w_1280", "w_480").replace("q_auto:good", "q_auto:low");

export default function Home() {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/lessons")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setLessons)
      .catch(() => setError("Could not load lessons. Check your MongoDB connection."));

    // Optional: if this fails, the page still works without the counter.
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => s && setStats(s))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="rounded-lg bg-[#17302b] px-6 py-8 text-[#f4f6f2]">
        <h1 className="display text-3xl font-semibold sm:text-4xl">Lessons that fit your data plan</h1>
        <p className="mt-3 max-w-prose text-[#d5ddd8]">
          Pick the version that suits your connection: video, low-data video, or just the audio and board photos.
        </p>
        {stats && stats.saved > 0 && (
          <p className="mt-5 inline-block rounded bg-[#e8b23a] px-3 py-1.5 text-sm font-medium text-[#10201c]">
            {size(stats.saved)} saved so far across {stats.lessonCount} {stats.lessonCount === 1 ? "lesson" : "lessons"}
          </p>
        )}
      </section>

      {error && <p role="alert" className="mt-6 text-red-700">{error}</p>}

      {!lessons && !error && (
        <ul aria-busy="true" className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-60 animate-pulse rounded-lg bg-[#17302b]/10" />
          ))}
        </ul>
      )}

      {lessons?.length === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-[#17302b]/40 p-8 text-center">
          <p className="display text-xl">No lessons yet</p>
          <p className="mt-1 text-[#3d4f4a]">Upload a short lecture to see the low-data versions.</p>
          <Link href="/teacher" className="mt-4 inline-block rounded bg-[#17302b] px-4 py-2 font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            Upload the first lesson
          </Link>
        </div>
      )}

      {lessons && lessons.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {lessons.map((l) => {
            const low = l.versions.find((v) => v.key === "low")?.bytes;
            const percent = l.originalBytes && low ? Math.max(0, Math.round((1 - low / l.originalBytes) * 100)) : 0;
            const img = thumb(l.snapshots?.[0]);
            const length = clock(l.duration);

            return (
              <li key={l._id}>
                <Link
                  href={`/lesson/${l._id}`}
                  className="group block overflow-hidden rounded-lg border border-[#17302b]/20 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17302b]"
                >
                  <div className="relative aspect-video bg-[#17302b]/10">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={`Frame from ${l.title}`} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute inset-0 m-auto h-10 w-10 fill-[#17302b]/40">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                    {percent > 0 && (
                      <span className="absolute left-2 top-2 rounded bg-[#e8b23a] px-2 py-0.5 text-xs font-semibold text-[#10201c]">
                        {percent}% smaller
                      </span>
                    )}
                    {length && (
                      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">{length}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h2 className="display text-lg font-medium leading-snug group-hover:underline">{l.title}</h2>
                    <p className="text-sm text-[#3d4f4a]">{l.subject}</p>
                    <p className="mt-2 text-xs text-[#3d4f4a]">
                      {size(l.originalBytes)} → <strong className="text-[#17302b]">{size(low)}</strong> on low data
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}