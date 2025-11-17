# 📘 Djivedé — Application principale

## 🔹 Nom de l'application

**Djivedé (App principale)**  
But : _Interface sécurisée pour les investisseurs et les administrateurs._

---

## 🧭 Structure Générale

### Pages sécurisées (`/pages`)

- `/dashboard` : tableau de bord investisseur
- `/dashboard/wallet` : portefeuille et intentions d’investissement
- `/dashboard/engagements` : suivi et signature d’engagements
- `/dashboard/admin/...` : section réservée aux administrateurs

---

## 👤 Authentification & Profils

- Auth via **Supabase** (`auth.users`)
- Table `profiles` liée via `user_id` :
  - `role` (`admin`, `investor`, etc.)
  - `full_name`, `phone`, etc.

### Redirections conditionnelles :

- `admin` ➜ `/dashboard/admin/overview`
- `investor` ➜ `/dashboard`

---

## 🔐 Sécurité & Permissions

- Middleware de redirection post-login
- Pages protégées par `withAuth()` selon rôle
- Vérification des rôles via `useAuth` + `useProfile`

---

## 🧩 Composants clés

- `InvestorDashboardPage.tsx` : accueil investisseur (cartes résumé, actions rapides)
- `AdminOverviewPage.tsx` : vue admin centrale
- `AdminProjectManager.tsx` : gestion des projets modulaires
- `InvestmentTable.tsx` : suivi des investissements
- `InvestorWalletPage.tsx` : portefeuille dynamique

---

## 📦 Backend

- Express (`server.js`) avec route `/api/resync-user`
- Relie automatiquement un nouvel utilisateur à ses données (`investment_intentions`, etc.)
- Nodemailer pour envoi d'e-mails depuis `emailService.js`
- Fichiers : `server.js`, `emailHelper.ts`

---

## 🛠️ Stack et outils

- Next.js + TypeScript
- Supabase
- Tailwind CSS
- React Query
- React Hook Form
- Stripe (gestion indirecte)
- Nodemailer
- Framer Motion

---

## ✅ Fonctionnalités en place

- Résumé portefeuille dynamique
- Tunnel investissement relié à Supabase
- Système d’engagement PDF avec signature
- Admin : vue projets, modules, investissements
- Tableaux statistiques (projets, modules, investisseurs)

---

## 🌱 À venir

- Gestion des rendements en temps réel
- Export PDF/Excel des données admin
- Notifications intégrées (Toasts / Emails)
- Amélioration du design mobile

---

## 🔧 Lancement local

```bash
# Installation
npm install

# Lancement
npm run dev
```
