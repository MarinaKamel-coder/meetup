// src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
"use client"

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SignUpPage() {
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
      <SignUp />
    </main>
  );
}
