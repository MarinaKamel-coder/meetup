// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Chargement...</p>
      </div>
    </div>
  );
}