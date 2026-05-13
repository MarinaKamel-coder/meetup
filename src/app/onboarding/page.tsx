"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingPage() {
  const router = useRouter();

  const selectRole = async (role: "PLAYER" | "ORGANIZER") => {
    const res = await fetch("/api/user/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) router.push(role === "ORGANIZER" ? "/dashboard" : "/profile");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-3xl font-bold mb-8">Bienvenue ! Quel est votre profil ?</h1>
      <div className="flex gap-6">
        <button
          onClick={() => selectRole("PLAYER")}
          className="p-8 border border-emerald-500 rounded-2xl hover:bg-emerald-500/10 transition"
        >
          <span className="text-4xl block mb-2">⚽</span>
          Je suis un Joueur
        </button>
        <button
          onClick={() => selectRole("ORGANIZER")}
          className="p-8 border border-blue-500 rounded-2xl hover:bg-blue-500/10 transition"
        >
          <span className="text-4xl block mb-2">📋</span>
          Je suis un Organisateur
        </button>
      </div>
    </div>
  );
}