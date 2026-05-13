// src/components/TournamentActions.tsx
"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTournament, updateTournament } from "@/server/actions/tournaments";

type Tournament = {
  id: string;
  name: string;
  sport: string;
  city: string;
  entryFee: number;
};

export default function TournamentActions({ tournament }: { tournament: Tournament }) {
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: tournament.name,
    sport: tournament.sport,
    city: tournament.city,
    entryFee: (tournament.entryFee / 100).toString(),
  });

  async function handleDelete() {
    if (!confirm("Supprimer ce tournoi ? Cette action est irréversible.")) return;
    setIsDeleting(true);
    const result = await deleteTournament(tournament.id);
    if (result?.error) {
      setIsError(true);
      setMessage(result.error);
      setIsDeleting(false);
    } else {
      router.push("/tournaments");
      router.refresh();
    }
  }

  async function handleUpdate() {
    const result = await updateTournament(tournament.id, {
      name: form.name,
      sport: form.sport,
      city: form.city,
      entryFee: Math.round(Number(form.entryFee) * 100),
    });
    if (result?.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage("Tournoi mis à jour !");
      setShowEdit(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">

      {/* Boutons actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowEdit(!showEdit)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ✏️ {showEdit ? "Annuler" : "Modifier"}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
        >
          {isDeleting ? "Suppression..." : "🗑️ Supprimer"}
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

      {/* Formulaire modification */}
      {showEdit && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Modifier le tournoi</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sport</label>
              <input
                value={form.sport}
                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Frais (en $, 0 = gratuit)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Sauvegarder les modifications
          </button>
        </div>
      )}
    </div>
  );
}