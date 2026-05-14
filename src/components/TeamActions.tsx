// src/components/TeamActions.tsx
"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTeam, deleteTeam, removeMemberFromTeam } from "@/server/actions/teams";

type Member = {
  id: string;
  fullName: string;
  playerProfile?: {
    city?: string | null;
    favoriteSport?: string | null;
    level?: string | null;
    position?: string | null;
  } | null;
  joinRequests?: {
    status: string;
    paymentStatus: string;
  }[];
};

type Team = {
  id: string;
  name: string;
  maxCapacity: number;
  tournamentId: string;
  membersCount: number;
  members?: Member[];
};

export default function TeamActions({ team }: { team: Team }) {
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: team.name,
    maxCapacity: team.maxCapacity.toString(),
  });

  const levelLabels: Record<string, string> = {
    BEGINNER: "🌱",
    INTERMEDIATE: "⚡",
    ADVANCED: "🔥",
  };

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

  async function handleRemoveMember(memberId: string, memberName: string) {
    if (!confirm(`Retirer ${memberName} de l'équipe ?`)) return;
    setRemovingId(memberId);
    const result = await removeMemberFromTeam(team.id, memberId);
    if (result?.error) {
      setIsError(true);
      setMessage(result.error);
    } else {
      setIsError(false);
      setMessage(`${memberName} a été retiré de l'équipe.`);
      router.refresh();
    }
    setRemovingId(null);
  }

  return (
    <div className="space-y-3">

      {/* Membres avec statuts */}
      {team.members && team.members.length > 0 && (
        <div className="space-y-2 mb-3">
          {team.members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                {member.fullName.charAt(0).toUpperCase()}
              </div>

              {/* Infos */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{member.fullName}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {member.playerProfile?.city && (
                    <span className="text-xs text-slate-400">📍 {member.playerProfile.city}</span>
                  )}
                  {member.playerProfile?.favoriteSport && (
                    <span className="text-xs text-slate-400">🏅 {member.playerProfile.favoriteSport}</span>
                  )}
                  {member.playerProfile?.position && (
                    <span className="text-xs text-slate-400">👤 {member.playerProfile.position}</span>
                  )}
                </div>

                {/* Badges statut */}
                {member.joinRequests?.[0] && (
                  <div className="flex gap-1 mt-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      member.joinRequests[0].status === "ACCEPTED"
                        ? "bg-emerald-100 text-emerald-700"
                        : member.joinRequests[0].status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {member.joinRequests[0].status === "ACCEPTED" ? "✅ Accepté" :
                       member.joinRequests[0].status === "PENDING" ? "⏳ En attente" : "❌ Refusé"}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      member.joinRequests[0].paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : member.joinRequests[0].paymentStatus === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {member.joinRequests[0].paymentStatus === "PAID" ? "💳 Payé" :
                       member.joinRequests[0].paymentStatus === "PENDING" ? "💳 En attente" : "🆓 Gratuit"}
                    </span>
                  </div>
                )}
              </div>

              {/* Niveau */}
              {member.playerProfile?.level && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 shrink-0">
                  {levelLabels[member.playerProfile.level]}
                </span>
              )}

              {/* Bouton retirer */}
              <button
                onClick={() => handleRemoveMember(member.id, member.fullName)}
                disabled={removingId === member.id}
                className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 shrink-0"
              >
                {removingId === member.id ? "..." : "❌"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Boutons actions équipe */}
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Capacité max</label>
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