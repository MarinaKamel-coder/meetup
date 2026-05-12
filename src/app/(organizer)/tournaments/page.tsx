// src/app/(organizer)/tournaments/page.tsx
"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTournament } from "@/server/actions/tournaments";

const tournamentSchema = z.object({
  name: z.string().min(5, "Le nom doit contenir au moins 5 caractères"),
  sport: z.string().min(2, "Le sport est requis"),
  city: z.string().min(2, "La ville est requise"),
  startDate: z.string().min(1, "La date est requise"),
  entryFee: z.coerce.number().min(0).default(0),
  currency: z.string().length(3).default("CAD"),
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

export default function TournamentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: { entryFee: 0, currency: "CAD" },
  });

  async function onSubmit(data: TournamentFormData) {
    const result = await createTournament({
      ...data,
      startDate: new Date(data.startDate),
    });

    if (result?.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage("Tournoi créé avec succès !");
      reset();
      setShowForm(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mes tournois</h2>
          <p className="text-sm text-slate-500 mt-1">
            Créez et gérez vos compétitions sportives.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {showForm ? "Annuler" : "+ Créer un tournoi"}
        </button>
      </div>

      {/* Message succès / erreur */}
      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          isError
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
          {message}
        </div>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-5">
            Nouveau tournoi
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom du tournoi
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="ex: Coupe de Montréal 2026"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Sport + Ville */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sport
                </label>
                <input
                  {...register("sport")}
                  type="text"
                  placeholder="ex: Football"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {errors.sport && (
                  <p className="mt-1 text-xs text-red-500">{errors.sport.message}</p>
                )}
              </div>
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
            </div>

            {/* Date + Frais */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date de début
                </label>
                <input
                  {...register("startDate")}
                  type="date"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Frais d'inscription{" "}
                  <span className="text-slate-400 font-normal">(en cents, 0 = gratuit)</span>
                </label>
                <input
                  {...register("entryFee")}
                  type="number"
                  min={0}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {errors.entryFee && (
                  <p className="mt-1 text-xs text-red-500">{errors.entryFee.message}</p>
                )}
              </div>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Création en cours..." : "Créer le tournoi"}
            </button>

          </form>
        </div>
      )}

      {/* Liste des tournois — placeholder pour l'instant */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-base font-medium text-slate-700">
          Aucun tournoi créé pour le moment
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Cliquez sur "+ Créer un tournoi" pour commencer.
        </p>
      </div>

    </div>
  );
}