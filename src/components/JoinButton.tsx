// src/components/JoinButton.tsx
"use client"

import { useState } from "react";
import { createJoinRequest } from "@/server/actions/join-requests";
import { useRouter } from "next/navigation";

export default function JoinButton({ 
  teamId,
  entryFee = 0,
}: { 
  teamId: string;
  entryFee?: number;
}) {
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isPaid = entryFee > 0;

  async function handleJoin() {
    setIsSubmitting(true);

    if (isPaid) {
      // Tournoi payant → rediriger vers Stripe Checkout
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId, message }),
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url; // Redirection vers Stripe
        } else {
          setIsError(true);
          setFeedback(data.error || "Erreur lors de la création du paiement.");
        }
      } catch (e) {
        setIsError(true);
        setFeedback("Erreur réseau. Réessayez.");
      }
    } else {
      // Tournoi gratuit → créer la demande directement
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
    }

    setIsSubmitting(false);
  }

  return (
    <div className="space-y-3">

      {/* Badge frais si tournoi payant */}
      {isPaid && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">💳</span>
          <div>
            <p className="text-sm font-bold text-amber-800">
              Tournoi payant — {(entryFee / 100).toFixed(2)} CAD
            </p>
            <p className="text-xs text-amber-600">
              Vous serez redirigé vers Stripe pour compléter le paiement.
            </p>
          </div>
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className={`w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
            isPaid
              ? "bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
              : "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
          }`}
        >
          {isPaid
            ? `Rejoindre et payer ${(entryFee / 100).toFixed(2)} CAD →`
            : "Rejoindre cette équipe →"}
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
              className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${
                isPaid
                  ? "bg-amber-500 hover:bg-amber-400"
                  : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {isSubmitting
                ? "Traitement..."
                : isPaid
                ? `Payer ${(entryFee / 100).toFixed(2)} CAD →`
                : "Envoyer la demande"}
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