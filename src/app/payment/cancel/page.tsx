// src/app/payment/cancel/page.tsx
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">

        {/* Icône annulation */}
        <div className="mx-auto h-24 w-24 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-8">
          <span className="text-5xl">❌</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-4">
          Paiement annulé
        </h1>

        <p className="text-slate-400 mb-8">
          Votre paiement a été annulé. Aucun montant n&apos;a été débité.
          Vous pouvez réessayer quand vous voulez.
        </p>

        <div className="space-y-3">
          <Link
            href="/teams"
            className="block w-full rounded-xl bg-emerald-500 px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-400"
          >
            Retour aux équipes →
          </Link>
          <Link
            href="/my-requests"
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Voir mes demandes
          </Link>
        </div>
      </div>
    </main>
  );
}