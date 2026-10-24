import { connectDB } from "../../lib/mongodb";
import Lesson from "../../models/Lessons";

export const dynamic = "force-dynamic";

type Version = { key: string; bytes?: number };
type LessonDoc = {
  _id: unknown;
  title: string;
  subject?: string;
  originalBytes?: number;
  versions: Version[];
};

export async function GET() {
  await connectDB();
  const lessons = (await Lesson.find().sort({ createdAt: -1 }).lean()) as unknown as LessonDoc[];

  const rows = lessons.map((l) => {
    const original = l.originalBytes ?? 0;
    const low = l.versions.find((v) => v.key === "low")?.bytes ?? 0;
    const audio = l.versions.find((v) => v.key === "audio")?.bytes ?? 0;
    const measured = original > 0 && low > 0;
    return {
      id: String(l._id),
      title: l.title,
      subject: l.subject ?? "General",
      original,
      low,
      audio,
      saved: measured ? Math.max(0, original - low) : 0,
      percent: measured ? Math.max(0, Math.round((1 - low / original) * 100)) : 0,
      measured,
    };
  });

  const counted = rows.filter((r) => r.measured);
  const totalOriginal = counted.reduce((s, r) => s + r.original, 0);
  const totalLow = counted.reduce((s, r) => s + r.low, 0);
  const saved = Math.max(0, totalOriginal - totalLow);

  return Response.json({
    lessonCount: rows.length,
    totalOriginal,
    totalLow,
    saved,
    percent: totalOriginal ? Math.round((saved / totalOriginal) * 100) : 0,
    rows,
  });
}