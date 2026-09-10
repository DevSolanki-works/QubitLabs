"use client";

import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Atom } from "lucide-react";

const QuantumLanding = dynamic(
  () => import("@/components/landing/QuantumLanding"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#07080c] text-white">
        <div className="flex items-center gap-3 text-cyan-300 font-mono text-sm">
          <Atom className="animate-spin text-cyan-400" size={24} />
          <span>Initializing QubitLabs Quantum Engine...</span>
        </div>
      </div>
    ),
  }
);

function QueryForwarder() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const lessonParam = searchParams.get("lesson");
    const challengeParam = searchParams.get("challenge");
    if (lessonParam || challengeParam) {
      const query = new URLSearchParams(searchParams.toString()).toString();
      router.replace(`/lab?${query}`);
    }
  }, [searchParams, router]);

  return null;
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <QueryForwarder />
      </Suspense>
      <QuantumLanding />
    </>
  );
}
