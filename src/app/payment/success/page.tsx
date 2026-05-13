// src/app/payment/success/page.tsx
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">

        {/* Icône succès */}
        <div className="mx-auto h-24 w-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-8">
          <span className="text-5xl">✅</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-4">
          Paiement réussi !
        </h1>

        <p className="text-slate-400 mb-8">
          Votre paiement a été confirmé. Votre demande d&apos;adhésion est maintenant
          visible par l&apos;organisateur qui pourra l&apos;accepter ou la refuser.
        </p>

        <div className="space-y-3">
          <Link
            href="/my-requests"
            className="block w-full rounded-xl bg-emerald-500 px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-400"
          >
            Voir mes demandes →
          </Link>
          <Link
            href="/teams"
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Retour aux équipes
          </Link>
        </div>
      </div>
    </main>
  );
}