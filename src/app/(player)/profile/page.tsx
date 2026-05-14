// src/app/(player)/profile/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { playerProfile: true },
  });

  if (!dbUser) redirect("/sign-in");

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Espace Joueur
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">Mon profil</h2>
          <p className="mt-2 text-slate-400">
            Ces informations sont visibles par les organisateurs.
          </p>
        </div>
      </div>

      <ProfileForm
        key={dbUser.playerProfile?.city + dbUser.fullName}
        defaultValues={{
          fullName: dbUser.fullName,
          city: dbUser.playerProfile?.city ?? "",
          favoriteSport: dbUser.playerProfile?.favoriteSport ?? "",
          level: dbUser.playerProfile?.level ?? "BEGINNER",
          position: dbUser.playerProfile?.position ?? "",
        }}
      />
    </div>
  );
}