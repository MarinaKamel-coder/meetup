// src/app/(player)/profile/page.tsx
"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updatePlayerProfile } from "@/server/actions/user";
import { useState } from "react";

const playerProfileSchema = z.object({
  fullName: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  city: z.string().min(2, "La ville est requise"),
  favoriteSport: z.string().min(2, "Le sport est requis"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  position: z.string().optional(),
});

type ProfileFormData = z.infer<typeof playerProfileSchema>;

export default function ProfilePage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(playerProfileSchema),
    defaultValues: {
      level: "BEGINNER",
    },
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
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Mon profil</h2>
      <p className="text-sm text-slate-500 mb-8">
        Ces informations sont visibles par les organisateurs.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Nom complet */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nom complet
          </label>
          <input
            {...register("fullName")}
            type="text"
            placeholder="ex: Marie Tremblay"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Ville
          </label>
          <input
            {...register("city")}
            type="text"
            placeholder="ex: Montréal"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {errors.city && (
            <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>

        {/* Sport */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Sport principal
          </label>
          <input
            {...register("favoriteSport")}
            type="text"
            placeholder="ex: Football, Basketball..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {errors.favoriteSport && (
            <p className="mt-1 text-xs text-red-500">{errors.favoriteSport.message}</p>
          )}
        </div>

        {/* Niveau */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Niveau
          </label>
          <select
            {...register("level")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          >
            <option value="BEGINNER">Débutant</option>
            <option value="INTERMEDIATE">Intermédiaire</option>
            <option value="ADVANCED">Avancé</option>
          </select>
        </div>

        {/* Poste (optionnel) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Poste préféré{" "}
            <span className="text-slate-400 font-normal">(optionnel)</span>
          </label>
          <input
            {...register("position")}
            type="text"
            placeholder="ex: Gardien, Attaquant..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Message de succès / erreur */}
        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              isError
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Enregistrement..." : "Sauvegarder le profil"}
        </button>

      </form>
    </div>
  );
}
