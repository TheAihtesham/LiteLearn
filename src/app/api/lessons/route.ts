import cloudinary from "../../lib/cloudinary";
import { connectDB } from "../../lib/mongodb";
import Lesson from "../../models/Lessons";

export const maxDuration = 60; // creating versions can take a while

const VERSIONS = [
  { key: "high", label: "High (720p)", t: { width: 1280, crop: "limit", quality: "auto:good", format: "mp4" } },
  { key: "medium", label: "Medium (480p)", t: { width: 854, crop: "limit", quality: "auto:eco", format: "mp4" } },
  { key: "low", label: "Low (240p)", t: { width: 426, crop: "limit", quality: "auto:low", format: "mp4" } },
  { key: "audio", label: "Audio only", t: { format: "mp3" } },
];

export async function GET() {
  await connectDB();
  const lessons = await Lesson.find().sort({ createdAt: -1 }).lean();
  return Response.json(lessons);
}

export async function POST(req: Request) {
  const { title, subject, publicId, duration, bytes, url } = await req.json();
  if (!title || !publicId) return Response.json({ error: "title and publicId are required" }, { status: 400 });

  const res = await cloudinary.uploader.explicit(publicId, {
    type: "upload",
    resource_type: "video",
    eager: VERSIONS.map((v) => v.t),
    eager_async: false,
  });

  const versions = VERSIONS.map((v, i) => ({
    key: v.key,
    label: v.label,
    url: res.eager?.[i]?.secure_url,
    bytes: res.eager?.[i]?.bytes,
  }));

  const step = duration > 600 ? 60 : 30;
  const snapshots: string[] = [];
  for (let t = 0; t < (duration || 0) && snapshots.length < 20; t += step) {
    snapshots.push(
      cloudinary.url(publicId, {
        resource_type: "video",
        format: "jpg",
        secure: true,
        transformation: [{ start_offset: t, width: 1280, crop: "limit", quality: "auto:good" }],
      })
    );
  }

  await connectDB();
  const lesson = await Lesson.create({
    title, subject, publicId, duration, originalBytes: bytes, originalUrl: url, versions, snapshots,
  });
  return Response.json(lesson, { status: 201 });
}
