import Link from "next/link";

const stats = [
    {
        label: "Tournois créés",
        value: "0", 
        description: "Compétitions actuellement gérées",
    }, 
    {
        label: "Équipes inscrites",
        value: "0",
        description: "Équipes actuellement enregistrées",
    }, 
    {
        label: "Demandes en attente",
        value: "0",
        description: "Candidatures à traiter",
    },     
];

const quickActions = [
    {
        title: "Créer un tournoi",
        description: "Lancez une nouvelle compétition et ouvrez les inscriptions",
        href: "/tournaments",
    },
    {
        title: "Gérer les demandes",
        description: "Consultez et validez les demandes d'adhésion des joueurs",
        href: "/requests",
    }, 
];

export default function DashboardPage() {
    return (
        
    <section className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
            Dashboard
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Vue d’ensemble de votre activité
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Suivez vos tournois, vos équipes et les demandes des joueurs depuis
            un tableau de bord centralisé.
          </p>
        </div>

        <Link
          href="/tournaments"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Gérer mes tournois
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-slate-600">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Mes tournois récents
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Retrouvez ici un aperçu rapide des compétitions que vous gérez.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-base font-medium text-slate-700">
              Aucun tournoi créé pour le moment
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Commencez par créer votre premier tournoi pour ouvrir les
              inscriptions aux équipes et aux joueurs.
            </p>

            <Link
              href="/tournaments"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Créer mon premier tournoi
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Actions rapides
            </h3>

            <div className="mt-4 space-y-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="block rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <p className="font-semibold text-slate-900">{action.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
              Conseil
            </p>
            <h3 className="mt-2 text-xl font-semibold">
              Priorisez le MVP pour avancer vite
            </h3>
            <p className="mt-3 text-sm text-slate-300">
              Créez d’abord vos tournois et vos équipes, puis testez le flux
              complet de demande d’adhésion avant d’ajouter des bonus.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}