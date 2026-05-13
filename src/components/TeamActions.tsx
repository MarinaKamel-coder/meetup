"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTeam, deleteTeam } from "@/server/actions/teams";

type Team = {
  id: string;
  name: string;
  maxCapacity: number;
  tournamentId: string;
  membersCount: number;
};

export default function TeamActions({ team }: { team: Team }) {
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: team.name,
    maxCapacity: team.maxCapacity.toString(),
  });

  async function handleDelete() {
    if (!confirm(`Supprimer l'équipe "${team.name}" ?`)) return;
    setIsDeleting(true);
    const result = await deleteTeam(team.id);
    if (result?.error) {
      setIsError(true);
      setMessage(result.error);
      setIsDeleting(false);
    } else {
      router.refresh();
    }
  }

  async function handleUpdate() {
    const result = await updateTeam(team.id, {
      name: form.name,
      maxCapacity: Number(form.maxCapacity),
    });
    if (result?.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage("Équipe mise à jour !");
      setShowEdit(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setShowEdit(!showEdit)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          ✏️ Modifier
        </button>
        {team.membersCount === 0 && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            {isDeleting ? "..." : "🗑️ Supprimer"}
          </button>
        )}
      </div>

      {message && (
        <div className={`rounded-lg px-3 py-2 text-xs font-medium ${
          isError
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
          {message}
        </div>
      )}

      {showEdit && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nom
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Capacité max
              </label>
              <input
                type="number"
                min={1}
                value={form.maxCapacity}
                onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
          <button
            onClick={handleUpdate}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Sauvegarder
          </button>
        </div>
      )}
    </div>
  );
}