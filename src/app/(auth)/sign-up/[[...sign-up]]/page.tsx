// src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
"use client"

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-6">
      {role && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-center">
          <p className="text-sm font-semibold text-emerald-400">
            {role === "organizer"
              ? "🏆 Vous créez un compte Organisateur"
              : "🏃 Vous créez un compte Joueur"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {role === "organizer"
              ? "Vous pourrez créer des tournois et gérer des équipes"
              : "Vous pourrez rejoindre des équipes et participer aux tournois"}
          </p>
        </div>
      )}
      <SignUp />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <SignUpContent />
    </Suspense>
  );
}