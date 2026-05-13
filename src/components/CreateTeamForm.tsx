// src/components/CreateTeamForm.tsx
"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createTeam } from "@/server/actions/teams";
import { useRouter } from "next/navigation";

type TeamFormData = {
  name: string;
  maxCapacity: number;
};

export default function CreateTeamForm({ tournamentId }: { tournamentId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormData>({
    defaultValues: { maxCapacity: 11 },
  });

  async function onSubmit(data: TeamFormData) {
    const result = await createTeam({
      name: data.name,
      tournamentId,
      maxCapacity: Number(data.maxCapacity),
    });

    if (result?.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage("Équipe créée avec succès !");
      reset();
      setShowForm(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
      >
        {showForm ? "Annuler" : "+ Ajouter une équipe"}
      </button>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          isError
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom de l&apos;équipe
                </label>
                <input
                  {...register("name", { required: "Le nom est requis" })}
                  type="text"
                  placeholder="ex: Les Aigles"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Capacité max
                </label>
                <input
                  {...register("maxCapacity")}
                  type="number"
                  min={2}
                  max={50}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? "Création..." : "Créer l'équipe"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}