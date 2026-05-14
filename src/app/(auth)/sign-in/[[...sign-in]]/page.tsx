// src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
"use client"

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  useEffect(() => {
    if (role === "organizer" || role === "player") {
      // Sauvegarder le rôle choisi pour après l'inscription
      sessionStorage.setItem("pendingRole", role);
    }
  }, [role]);

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center">
      <SignIn />
    </main>
  );
}
