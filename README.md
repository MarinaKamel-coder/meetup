# 🏆 Meetup Sportif

> Plateforme de gestion de ligues sportives communautaires — Hackathon 48h

**FullStack FC** | Web Transactionnelle gr.24636 | Mai 2026  
**Équipe :** Sonia Corbin (Frontend) · Marina Kamel (Backend / BDD / Auth / Stripe)  
**GitHub :** https://github.com/MarinaKamel-coder/meetup

---

## 📋 Description

Meetup Sportif connecte **organisateurs** et **joueurs** autour de tournois sportifs communautaires.  
Inspiré de Meetup.com, la plateforme permet de créer des ligues, gérer des équipes et orchestrer des demandes d'adhésion avec paiement intégré.

---

## 🚀 Stack Technologique

| Technologie | Usage |
|-------------|-------|
| **Next.js 16** | Framework full-stack (App Router, Server Components, Server Actions) |
| **TypeScript** | Typage statique |
| **Prisma 7** | ORM + migrations PostgreSQL |
| **Neon** | Base de données PostgreSQL serverless |
| **Clerk** | Authentification + gestion des rôles |
| **Stripe** | Paiements pour tournois payants |
| **Tailwind CSS** | Styling utility-first |
| **Zod** | Validation des données côté serveur |
| **React Hook Form** | Gestion des formulaires |

---

## ⚙️ Prérequis

- Node.js 20+
- Un compte [Neon](https://neon.tech)
- Un compte [Clerk](https://clerk.com)
- Un compte [Stripe](https://stripe.com) en mode test

---
## 📦 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/MarinaKamel-coder/meetup.git
cd meetup
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

```env
# Base de données Neon
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Générer le client Prisma

```bash
npx prisma generate
```

### 5. Appliquer les migrations

```bash
npx prisma migrate dev
```

### 6. Remplir la base de données

```bash
npm run db:seed
```

### 7. Lancer le serveur

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000)

