"use client"

import { useState } from "react";
import { createJoinRequest } from "@/server/actions/join-requests";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; // Utilise react-hot-toast pour une UI pro
import { CreditCard, Send, Loader2 } from "lucide-react";

export default function JoinButton({ 
  teamId,
  entryFee = 0,
}: { 
  teamId: string;
  entryFee?: number;
}) {
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isPaid = entryFee > 0;

  async function handleJoin() {
    setIsSubmitting(false); // Reset au cas où
    setIsSubmitting(true);

    try {
      if (isPaid) {
        // --- LOGIQUE PAYANTE (API ROUTE) ---
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId, message }),
        });

        // Sécurité : Si l'API renvoie 404 ou 500
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erreur serveur (${response.status})`);
        }

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("L'URL de paiement est manquante.");
        }

      } else {
        // --- LOGIQUE GRATUITE (SERVER ACTION) ---
        const result = await createJoinRequest(teamId, message);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Demande envoyée !");
          setShowForm(false);
          router.refresh();
        }
      }
    } catch (e: any) {
      console.error("Join Error:", e);
      toast.error(e.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {isPaid && !showForm && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Frais d'inscription : {(entryFee / 100).toFixed(2)} CAD
            </p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Paiement sécurisé via Stripe. Votre place ne sera validée qu'après confirmation du paiement.
            </p>
          </div>
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className={`group w-full flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase italic tracking-tighter transition-all duration-300 ${
            isPaid
              ? "bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
          }`}
        >
          {isPaid ? "S'inscrire et payer" : "Rejoindre l'équipe"}
          <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Message pour l'organisateur
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Pourquoi voulez-vous rejoindre cette équipe ?"
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all resize-none outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleJoin}
              disabled={isSubmitting}
              className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPaid ? (
                "Aller au paiement"
              ) : (
                "Confirmer"
              )}
            </button>
            <button
              onClick={() => setShowForm(false)}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}