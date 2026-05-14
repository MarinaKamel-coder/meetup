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

export default clerkMiddleware(async (auth, req) => {
  // On récupère l'URL pour vérifier si c'est une route API
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');

  // 1. Si c'est une route publique, on laisse passer
  if (isPublicRoute(req)) return;

  // 2. Si c'est une route API (comme /api/checkout), on protège mais sans redirection forcée vers le login
  // Cela permet de renvoyer une erreur 401 propre au lieu d'un HTML de page de connexion
  if (isApiRoute) {
    await auth.protect();
  } else {
    // Pour les pages normales, redirection vers le login si non connecté
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};