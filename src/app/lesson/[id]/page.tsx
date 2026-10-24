"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Version = { key: string; label: string; url?: string; bytes?: number };
type Lesson = {
  title: string;
  subject: string;
  duration?: number;
  originalBytes?: number;
  originalUrl?: string;
  versions: Version[];
  snapshots?: string[];
};

const size = (b?: number) =>
  !b ? "size unknown" : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

const clock = (s?: number) => {
  if (!s) return "";
  const t = Math.round(s);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

const hints: Record<string, string> = {
  high: "Best picture",
  medium: "Balanced",
  low: "Lightest video",
  audio: "Voice only",
};

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [key, setKey] = useState("medium");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/lessons/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setLesson)
      .catch(() => setError("We couldn't find this lesson."));
  }, [id]);

  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-[#17302b]/40 p-8 text-center">
        <p role="alert" className="display text-xl">{error}</p>
        <Link href="/lessons" className="mt-3 inline-block underline">Back to all lessons</Link>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div aria-busy="true" className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-[#17302b]/10" />
        <div className="aspect-video animate-pulse rounded-lg bg-[#17302b]/10" />
        <div className="h-24 animate-pulse rounded-lg bg-[#17302b]/10" />
      </div>
    );
  }

  const original = lesson.originalBytes;
  const current = lesson.versions.find((v) => v.key === key) ?? lesson.versions[0];
  const isAudio = current?.key === "audio";
  const saved = original && current?.bytes ? Math.max(0, original - current.bytes) : 0;
  const savedPercent = original && saved ? Math.round((saved / original) * 100) : 0;
  const snapshots = lesson.snapshots ?? [];
  const length = clock(lesson.duration);

  return (
    <article>
      <Link
        href="/lessons"
        className="inline-flex items-center gap-1 text-sm text-[#3d4f4a] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span aria-hidden="true">←</span> All lessons
      </Link>

      <header className="mt-3">
        <p className="inline-block rounded-full bg-[#17302b]/10 px-3 py-0.5 text-sm">
          {lesson.subject}
          {length && ` · ${length}`}
        </p>
        <h1 className="display mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{lesson.title}</h1>
      </header>

      {/* Player */}
      <section aria-label="Lesson player" className="mt-6 overflow-hidden rounded-lg bg-[#17302b]">
        {current?.url &&
          (isAudio ? (
            <div className="flex flex-col items-center gap-4 px-6 py-10 text-center text-[#f4f6f2]">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-12 w-12 fill-[#e8b23a]">
                <path d="M12 3a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h1v-8H5v-1a7 7 0 0 1 14 0v1h-2v8h1a3 3 0 0 0 3-3v-6a9 9 0 0 0-9-9z" />
              </svg>
              <p className="max-w-prose text-[#d5ddd8]">
                Audio only. Read the{" "}
                <a href="#board" className="underline">board photos below</a> while you listen.
              </p>
              <audio key={current.url} controls src={current.url} className="w-full max-w-md" />
            </div>
          ) : (
            <video
              key={current.url}
              controls
              playsInline
              src={current.url}
              className="aspect-video w-full bg-black"
            />
          ))}
      </section>

      {saved > 0 && (
        <p role="status" className="mt-3 rounded-lg bg-[#e8b23a]/25 px-4 py-3">
          This version saves you <strong>{size(saved)}</strong> ({savedPercent}% less data) compared with the original
          {original ? ` of ${size(original)}` : ""}.
        </p>
      )}

      {/* Quality picker */}
      <fieldset className="mt-8">
        <legend className="display text-2xl font-semibold">Choose how to watch</legend>
        <p className="mt-1 text-sm text-[#3d4f4a]">Pick the version your connection can handle. Sizes are shown before you play.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {lesson.versions.map((v) => {
            const pct = original && v.bytes ? Math.max(0, Math.round((1 - v.bytes / original) * 100)) : 0;
            const width = original && v.bytes ? Math.max(3, Math.min(100, Math.round((v.bytes / original) * 100))) : 100;
            return (
              <label key={v.key} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  value={v.key}
                  checked={v.key === current?.key}
                  onChange={() => setKey(v.key)}
                  className="peer sr-only"
                />
                <span className="block h-full rounded-lg border border-[#17302b]/25 bg-white p-4 transition peer-checked:border-[#17302b] peer-checked:ring-2 peer-checked:ring-[#17302b] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#17302b]">
                  <span className="block font-medium">{v.label}</span>
                  <span className="block text-xs text-[#3d4f4a]">{hints[v.key] ?? ""}</span>
                  <span className="display mt-2 block text-2xl">{size(v.bytes)}</span>
                  <span className="mt-2 block h-1.5 rounded bg-[#17302b]/10">
                    <span
                      className={`block h-1.5 rounded ${v.key === "audio" ? "bg-[#e8b23a]" : "bg-[#17302b]"}`}
                      style={{ width: `${width}%` }}
                    />
                  </span>
                  <span className="mt-1 block text-xs text-[#3d4f4a]">
                    {pct > 0 ? `${pct}% smaller than original` : "Compared with original"}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {original && (
          <p className="mt-3 text-sm text-[#3d4f4a]">
            Original upload: <strong className="text-[#10201c]">{size(original)}</strong>
          </p>
        )}
      </fieldset>

      {/* Board photos */}
      {snapshots.length > 0 && (
        <section id="board" aria-labelledby="board-title" className="mt-12 scroll-mt-24">
          <h2 id="board-title" className="display text-2xl font-semibold">Board photos</h2>
          <p className="mt-1 max-w-prose text-[#3d4f4a]">
            Sharp still frames from the lesson. Pair them with the audio version to learn with very little data. Tap a photo to open it full size.
          </p>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {snapshots.map((src, i) => (
              <li key={src}>
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-lg border border-[#17302b]/20 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17302b]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src.replace("w_1280", "w_640")}
                    alt={`Board photo ${i + 1} of ${snapshots.length}`}
                    loading="lazy"
                    className="aspect-video w-full object-cover transition group-hover:opacity-90"
                  />
                  <span className="block px-3 py-2 text-xs text-[#3d4f4a]">
                    Photo {i + 1} · open full size
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}