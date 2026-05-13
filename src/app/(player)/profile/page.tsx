// src/app/(player)/profile/page.tsx
"use client"

import { useForm } from "react-hook-form";
import { useState } from "react";
import { updatePlayerProfile } from "@/server/actions/user";

type ProfileFormData = {
  fullName: string;
  city: string;
  favoriteSport: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  position?: string;
};

const levels = [
  { value: "BEGINNER", label: "Débutant", emoji: "🌱" },
  { value: "INTERMEDIATE", label: "Intermédiaire", emoji: "⚡" },
  { value: "ADVANCED", label: "Avancé", emoji: "🔥" },
];

export default function ProfilePage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: { level: "BEGINNER" },
  });

  async function onSubmit(data: ProfileFormData) {
    const result = await updatePlayerProfile(data);
    if (result?.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage("Profil mis à jour avec succès !");
    }
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Espace Joueur
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">Mon profil</h2>
          <p className="mt-2 text-slate-400">
            Ces informations sont visibles par les organisateurs.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Nom + Ville */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom complet
              </label>
              <input
                {...register("fullName", { required: "Le nom est requis", minLength: { value: 3, message: "Au moins 3 caractères" } })}
                type="text"
                placeholder="ex: Marie Tremblay"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              {errors.fullName && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ville
              </label>
              <input
                {...register("city", { required: "La ville est requise" })}
                type="text"
                placeholder="ex: Montréal"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              {errors.city && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.city.message}</p>}
            </div>
          </div>

          {/* Sport + Poste */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sport principal
              </label>
              <input
                {...register("favoriteSport", { required: "Le sport est requis" })}
                type="text"
                placeholder="ex: Football, Basketball..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              {errors.favoriteSport && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.favoriteSport.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Poste préféré{" "}
                <span className="text-slate-400 font-normal">(optionnel)</span>
              </label>
              <input
                {...register("position")}
                type="text"
                placeholder="ex: Gardien, Attaquant..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
          </div>

          {/* Niveau */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Niveau
            </label>
            <div className="grid grid-cols-3 gap-3">
              {levels.map((level) => (
                <label
                  key={level.value}
                  className="relative cursor-pointer"
                >
                  <input
                    {...register("level")}
                    type="radio"
                    value={level.value}
                    className="peer sr-only"
                  />
                  <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-center transition peer-checked:border-emerald-500 peer-checked:bg-emerald-50 hover:border-slate-300">
                    <p className="text-2xl mb-1">{level.emoji}</p>
                    <p className="text-sm font-semibold text-slate-700 peer-checked:text-emerald-700">
                      {level.label}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
              isError
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              {isError ? "❌" : "✅"} {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Enregistrement..." : "Sauvegarder le profil →"}
          </button>

        </form>
      </div>
    </div>
  );
}