# 🚀 Tecnova - SaaS Commerce Multi-Tenant

**Tecnova** est une solution complète de gestion commerciale (PWA) conçue pour les entreprises et boutiques. Elle permet de gérer plusieurs boutiques de manière isolée (Multi-tenant) avec une synchronisation en temps réel.

## ✨ Fonctionnalités Clés

- 🏪 **Multi-Tenant :** Chaque entreprise possède sa propre base de données isolée.
- 💰 **Caisse (POS) :** Interface de vente rapide et intuitive.
- 📦 **Gestion de Stock :** Alertes de rupture de stock et historique des mouvements.
- 👥 **Clients & Fournisseurs :** Suivi des dettes clients et gestion des approvisionnements.
- 📊 **Tableau de Bord Exécutif :** Visualisation en temps réel du CA, des bénéfices et des KPIs.
- 📑 **Rapports :** Statistiques quotidiennes, hebdomadaires, mensuelles et annuelles.
- 💸 **Dépenses :** Suivi rigoureux des charges de l'entreprise.

## 🛠 Stack Technique

- **Frontend :** Next.js 14+ (App Router), Tailwind CSS, Lucide Icons.
- **Backend :** NestJS (Node.js framework).
- **ORM :** Prisma avec PostgreSQL.
- **Sécurité :** Authentification JWT, Hashage de mots de passe avec `bcryptjs`.
- **Architecture :** Monorepo (Turbo).
- **Hébergement :** O2Switch (Production).

## 📂 Structure du Monorepo

```text
├── apps
│   ├── web/          # Application Frontend (Next.js)
│   └── api/          # API REST Backend (NestJS)
├── packages          # Configurations partagées (ESLint, UI, etc.)
└── prisma/           # Schéma de la base de données