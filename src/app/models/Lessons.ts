import mongoose, { Schema, models, model } from "mongoose";

const VersionSchema = new Schema(
  { key: String, label: String, url: String, bytes: Number },
  { _id: false }
);

const LessonSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, default: "General" },
  publicId: { type: String, required: true },
  duration: Number,
  originalBytes: Number,
  originalUrl: String,
  versions: [VersionSchema],
  snapshots: [String],
  createdAt: { type: Date, default: Date.now },
});

export default models.Lesson || model("Lesson", LessonSchema);
