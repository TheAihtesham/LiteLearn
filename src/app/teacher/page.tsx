"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CloudinaryVideo = {
  public_id?: string;
  duration?: number;
  bytes?: number;
  secure_url?: string;
  error?: { message?: string };
};

const SUBJECTS = ["Maths", "Science", "English", "Social Studies"];
const STEPS = ["Prepare", "Upload video", "Create versions"];
const WARN_BYTES = 100 * 1024 * 1024;

const size = (b: number) =>
  b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

// Uses XMLHttpRequest so we can show real upload progress.
function uploadWithProgress(url: string, form: FormData, onProgress: (p: number) => void) {
  return new Promise<CloudinaryVideo>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data: CloudinaryVideo = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
      
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data.error?.message || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

export default function Teacher() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(-1); // -1 = idle
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const busy = step >= 0;
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function choose(f: File | null | undefined) {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    setError("");
    setFile(f);
  }

  async function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!file || !title.trim() || busy) return;
    setError("");
    setPercent(0);
    try {
      setStep(0);
      const s = await (await fetch("/api/sign-upload", { method: "POST" })).json();

      setStep(1);
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", s.apiKey);
      form.append("timestamp", s.timestamp);
      form.append("signature", s.signature);
      const video = await uploadWithProgress(
        `https://api.cloudinary.com/v1_1/${s.cloudName}/video/upload`,
        form,
        setPercent
      );

      setStep(2);
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subject: subject.trim() || "General",
          publicId: video.public_id,
          duration: video.duration,
          bytes: video.bytes,
          url: video.secure_url,
        }),
      });
      const lesson = await res.json();
      if (!res.ok) throw new Error(lesson.error || "Could not create the lesson");
      router.push(`/lesson/${lesson._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep(-1);
    }
  }

  const input =
    "mt-1 w-full rounded-lg border border-[#17302b]/30 bg-white px-3 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#17302b] disabled:opacity-60";

  return (
    <div>
      <h1 className="display text-3xl font-semibold sm:text-4xl">Upload a lesson</h1>
      <p className="mt-2 max-w-prose text-[#3d4f4a]">
        Upload one video. LiteLearn creates lighter versions, an audio track and board photos for you.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <form onSubmit={submit} className="space-y-5 lg:col-span-3">
          <div>
            <label htmlFor="title" className="font-medium">Lesson title</label>
            <input
              id="title"
              className={input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to fractions"
              maxLength={120}
              disabled={busy}
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="font-medium">Subject</label>
            <input
              id="subject"
              className={input}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Maths, Science…"
              maxLength={40}
              disabled={busy}
            />
            <div className="mt-2 flex flex-wrap gap-2" aria-label="Suggested subjects">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy}
                  onClick={() => setSubject(s)}
                  className={`rounded-full border px-3 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17302b] ${
                    subject === s ? "border-[#17302b] bg-[#17302b] text-white" : "border-[#17302b]/30 bg-white hover:bg-[#17302b]/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="font-medium">Video file</span>
            <input
              id="video"
              type="file"
              accept="video/*"
              className="peer sr-only"
              disabled={busy}
              onChange={(e) => choose(e.target.files?.[0])}
            />
            <label
              htmlFor="video"
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); if (!busy) choose(e.dataTransfer.files?.[0]); }}
              className={`mt-1 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#17302b] ${
                dragging ? "border-[#17302b] bg-[#e8b23a]/25" : "border-[#17302b]/40 bg-white hover:bg-[#17302b]/5"
              } ${busy ? "pointer-events-none opacity-60" : ""}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9 fill-none stroke-[#17302b]" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V5m0 0l-4 4m4-4l4 4M5 19h14" />
              </svg>
              {file ? (
                <>
                  <span className="font-medium break-all">{file.name}</span>
                  <span className="text-sm text-[#3d4f4a]">{size(file.size)} · tap to choose a different file</span>
                </>
              ) : (
                <>
                  <span className="font-medium">Choose a video or drop it here</span>
                  <span className="text-sm text-[#3d4f4a]">A 1 to 2 minute clip works well for testing</span>
                </>
              )}
            </label>

            {file && file.size > WARN_BYTES && (
              <p className="mt-2 rounded bg-[#e8b23a]/25 px-3 py-2 text-sm">
                This file is large ({size(file.size)}). It will use more of your Cloudinary free allowance and may be slow to process.
              </p>
            )}
          </div>

          {preview && (
            <video src={preview} controls muted playsInline className="aspect-video w-full rounded-lg bg-black" aria-label="Preview of your selected video" />
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !file || !title.trim()}
            className="w-full rounded-lg bg-[#17302b] px-4 py-3 font-medium text-white transition hover:bg-[#1f3f38] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17302b] sm:w-auto"
          >
            {busy ? "Working…" : "Upload lesson"}
          </button>
        </form>

        <aside className="lg:col-span-2">
          <div className="rounded-lg border border-[#17302b]/20 bg-white p-5">
            <h2 className="display text-xl font-semibold">{busy ? "Progress" : "What happens next"}</h2>

            <ol className="mt-4 space-y-4" aria-live="polite">
              {STEPS.map((label, i) => {
                const done = busy && step > i;
                const current = busy && step === i;
                return (
                  <li key={label} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                        done ? "bg-[#17302b] text-white" : current ? "bg-[#e8b23a] text-[#10201c]" : "bg-[#17302b]/10"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={current ? "font-medium" : ""}>
                        {label}
                        {done && <span className="sr-only"> (done)</span>}
                        {current && <span className="sr-only"> (in progress)</span>}
                      </p>
                      {i === 1 && current && (
                        <div className="mt-2">
                          <div
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percent}
                            aria-label="Upload progress"
                            className="h-2 rounded bg-[#17302b]/10"
                          >
                            <div className="h-2 rounded bg-[#17302b] transition-all" style={{ width: `${percent}%` }} />
                          </div>
                          <p className="mt-1 text-xs text-[#3d4f4a]">{percent}%</p>
                        </div>
                      )}
                      {i === 2 && current && (
                        <p className="mt-1 text-xs text-[#3d4f4a]">This can take up to a minute. Please keep this page open.</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {!busy && (
              <ul className="mt-5 space-y-1.5 border-t border-[#17302b]/15 pt-4 text-sm text-[#3d4f4a]">
                <li>• 720p, 480p and 240p video versions</li>
                <li>• An audio-only version</li>
                <li>• Sharp board photos from the video</li>
                <li>• File sizes shown before students choose</li>
              </ul>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
}