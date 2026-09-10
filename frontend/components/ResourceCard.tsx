"use client";

import { ExternalLink, BookOpen, GraduationCap, Video, Laptop, FileText, Bookmark, Star } from "lucide-react";
import { QuantumResource, ResourceType } from "@/lib/resources";

type ResourceCardProps = {
  resource: QuantumResource;
  isRecommended?: boolean;
};

const TYPE_CONFIG: Record<
  ResourceType,
  { label: string; icon: typeof BookOpen; color: string }
> = {
  book: { label: "Textbook", icon: BookOpen, color: "text-amber-400 bg-amber-400/10 border-amber-400/25" },
  course: { label: "Course / OCW", icon: GraduationCap, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25" },
  video: { label: "Video Lecture", icon: Video, color: "text-rose-400 bg-rose-400/10 border-rose-400/25" },
  interactive: { label: "Interactive Tool", icon: Laptop, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25" },
  documentation: { label: "Documentation", icon: FileText, color: "text-blue-400 bg-blue-400/10 border-blue-400/25" },
  lecture_notes: { label: "Lecture Notes", icon: Bookmark, color: "text-violet-400 bg-violet-400/10 border-violet-400/25" },
};

export default function ResourceCard({ resource, isRecommended }: ResourceCardProps) {
  const typeInfo = TYPE_CONFIG[resource.type] || TYPE_CONFIG.documentation;
  const TypeIcon = typeInfo.icon;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition hover:border-cyan-400/40 hover:bg-white/[0.03] ${
        isRecommended
          ? "border-cyan-400/30 bg-gradient-to-br from-cyan-950/20 via-[#070c14] to-[#070c14] shadow-[0_0_20px_rgba(6,182,212,0.1)]"
          : "border-white/10 bg-[#070c14]"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${typeInfo.color}`}
            >
              <TypeIcon size={12} />
              <span>{typeInfo.label}</span>
            </span>

            {isRecommended && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                <Star size={10} className="fill-amber-300" />
                <span>Recommended</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
              {resource.level}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                resource.free
                  ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border border-slate-700 bg-slate-800 text-slate-400"
              }`}
            >
              {resource.free ? "Free" : "Academic"}
            </span>
          </div>
        </div>

        {/* Title & Provider */}
        <h4 className="mt-4 text-base font-semibold text-white group-hover:text-cyan-200 transition">
          {resource.title}
        </h4>
        <div className="mt-1 text-xs font-medium text-slate-400">
          {resource.provider}
          {resource.durationOrPages && (
            <span className="text-slate-500"> · {resource.durationOrPages}</span>
          )}
        </div>

        {/* Description */}
        <p className="mt-3 text-xs leading-relaxed text-slate-300">
          {resource.description}
        </p>

        {/* Why Recommended */}
        <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.015] p-3 text-[11px] leading-relaxed text-slate-400">
          <span className="font-semibold text-cyan-300/90">Why study this: </span>
          {resource.whyRecommended}
        </div>
      </div>

      {/* External Link Action */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs font-semibold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200"
        >
          <span>Open Verified Resource</span>
          <ExternalLink size={13} className="text-slate-400 group-hover:text-cyan-300" />
        </a>
      </div>
    </div>
  );
}
