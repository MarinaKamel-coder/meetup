// src/app/(organizer)/matches/page.tsx
"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createMatch } from "@/server/actions/matches";

const matchSchema = z.object({
  teamAId: z.string().cuid("Équipe A requise"),
  teamBId: z.string().cuid("Équipe B requise"),
  date: z.string().min(1, "La date est requise"),
  location: z.string().min(3, "Le lieu est requis"),
});

type MatchFormData = z.infer<typeof matchSchema>;

// TODO: remplacer par un fetch réel des équipes de l'organisateur
const mockTeams = [
  { id: "", name: "Sélectionner une équipe" },
];

export default function OrganizerMatchesPage() {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
  });

  async function onSubmit(data: MatchFormData) {
    const result = await createMatch({
      ...data,
      date: new Date(data.date),
    });

    if (result?.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage("Match créé avec succès !");
      reset();
      setShowForm(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Matchs</h2>
          <p className="text-sm text-slate-500 mt-1">
            Planifiez les matchs entre vos équipes.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {showForm ? "Annuler" : "+ Créer un match"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          isError
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
          {message}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-5">
            Nouveau match
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Équipe A */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Équipe A
              </label>
              <input
                {...register("teamAId")}
                type="text"
                placeholder="ID de l'équipe A"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {errors.teamAId && (
                <p className="mt-1 text-xs text-red-500">{errors.teamAId.message}</p>
              )}
            </div>

            {/* Équipe B */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Équipe B
              </label>
              <input
                {...register("teamBId")}
                type="text"
                placeholder="ID de l'équipe B"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {errors.teamBId && (
                <p className="mt-1 text-xs text-red-500">{errors.teamBId.message}</p>
              )}
            </div>

            {/* Date + Lieu */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date et heure
                </label>
                <input
                  {...register("date")}
                  type="datetime-local"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lieu
                </label>
                <input
                  {...register("location")}
                  type="text"
                  placeholder="ex: Stade Saputo"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? "Création..." : "Créer le match"}
            </button>

          </form>
        </div>
      )}

      {/* Placeholder liste */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-base font-medium text-slate-700">
          Aucun match planifié pour le moment.
        </p>
      </div>

    </div>
  );
}