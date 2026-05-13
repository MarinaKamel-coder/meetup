// src/components/CreateMatchForm.tsx
"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createMatch } from "@/server/actions/matches";
import { useRouter } from "next/navigation";

type MatchFormData = {
  teamAId: string;
  teamBId: string;
  date: string;
  location: string;
};

export default function CreateMatchForm({
  tournamentId,
  teams,
}: {
  tournamentId: string;
  teams: { id: string; name: string }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<MatchFormData>();

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
      setMessage("Match créé !");
      reset();
      setShowForm(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowForm(!showForm)}
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        {showForm ? "Annuler" : "+ Planifier un match"}
      </button>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Équipe A</label>
                <select
                  {...register("teamAId", { required: true })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="">Choisir...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Équipe B</label>
                <select
                  {...register("teamBId", { required: true })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="">Choisir...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date et heure</label>
                <input
                  {...register("date", { required: true })}
                  type="datetime-local"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
                <input
                  {...register("location", { required: true })}
                  type="text"
                  placeholder="ex: Stade Saputo"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
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
    </div>
  );
}