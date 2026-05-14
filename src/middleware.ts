// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding",
  "/api/webhooks/(.*)",
  "/api/user/(.*)",
]);

// Route matcher pour protéger spécifiquement l'admin au niveau du middleware (optionnel mais recommandé)
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Si la route n'est pas publique, on exige une connexion
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Protection contre le scan des fichiers statiques et Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Toujours exécuter pour les routes API
    '/(api|trpc)(.*)',
  ],
};