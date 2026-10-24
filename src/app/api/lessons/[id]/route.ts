import { connectDB } from "../../../lib/mongodb";
import Lesson from "../../../models/Lessons";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const lesson = await Lesson.findById(id).lean();
  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 });
  return Response.json(lesson);
}
