// src/components/JoinButton.tsx
"use client"

import { useState } from "react";
import { createJoinRequest } from "@/server/actions/join-requests";
import { useRouter } from "next/navigation";

export default function JoinButton({ teamId }: { teamId: string }) {
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleJoin() {
    setIsSubmitting(true);
    const result = await createJoinRequest(teamId, message);

    if (result?.error) {
      setIsError(true);
      setFeedback(result.error);
    } else {
      setIsError(false);
      setFeedback("Demande envoyée avec succès !");
      setShowForm(false);
      router.refresh();
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-3">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          Rejoindre cette équipe
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Message de motivation{" "}
            <span className="text-slate-400 font-normal">(optionnel)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="Présentez-vous brièvement..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleJoin}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? "Envoi..." : "Envoyer la demande"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          isError
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
          {feedback}
        </div>
      )}
    </div>
  );
}