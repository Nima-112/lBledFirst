
## Objectif

Remplacer 3 sections de la landing par 3 nouvelles sections issues des fichiers fournis (HorizontalGallery, Timeline, Activities), et ajouter le vert marocain aux traits internes des icônes du site.

## 1. Suppression de sections

Supprimer et retirer de `src/routes/index.tsx` :
- `Story` (« A day in the bled »)
- `HowItWorks` (« How it works »)
- `FeaturedRegions` (« Featured regions »)

Fichiers à supprimer :
- `src/components/landing/Story.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/FeaturedRegions.tsx`

## 2. Nouvelles sections (ordre exact)

Insérer à la place, dans cet ordre, après `Experiences` :
1. `HorizontalGallery` — Discover / Rural Morocco
2. `Timeline` — A day with Lbled First / From dawn to stars
3. `Activities` — What awaits you / Experiences, not excursions

### Adaptations techniques (contenu identique, intégration propre)

- Réécrire les 3 composants en TypeScript (`.tsx`) sous `src/components/landing/` en gardant **textes, ordre, structure identiques** aux fichiers fournis.
- Remplacer GSAP + ScrollTrigger par **Framer Motion** (déjà utilisé partout, évite d'ajouter une dépendance). Les effets : apparition au scroll (Timeline / Activities) via `whileInView`, scroll horizontal pinné (HorizontalGallery) via `useScroll` + `useTransform` avec un wrapper `sticky top-0 h-screen`.
- Remplacer les styles inline + variables `--color-*` par les **tokens Tailwind du design system** (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-ink`, fonts `font-display`/`font-hand`, etc.) pour rester cohérent avec le reste du site. Aucun code couleur en dur.
- Espacements alignés sur les autres sections (`py-20 sm:py-28`, `max-w-7xl`, `px-4 sm:px-6`).
- i18n : câbler les textes via `useI18n()` avec des clés `gallery.*`, `timeline.*`, `activities.*` ajoutées aux 4 langues (FR/EN/ES/AR) dans `src/lib/i18n.tsx`. Le contenu de base reste celui fourni (EN), traductions équivalentes pour les 3 autres langues.
- Images : les fichiers fournis référencent des noms locaux (`atlas.jpg`, `tagine.jpg`, `mountains.jpg`…). Je génère les visuels manquants via `imagegen` (photos rurales marocaines, style documentaire, non-cliché) et je les importe depuis `src/assets/`. Réutilisation quand possible des images de régions déjà présentes.

## 3. Charte graphique — vert marocain sur les icônes

Ajout d'un token sémantique `--moroccan-green` dans `src/styles.css` (mappé en Tailwind via `@theme inline` → utilitaires `text-moroccan-green` / `bg-moroccan-green`). Valeur : vert du drapeau marocain (≈ `oklch(0.45 0.14 155)`).

Application :
- Icônes **Lucide** utilisées dans la landing (Hero, WhatIs, HowItWorks retiré, MoroccoMap, Navbar, Experiences, Footer, etc.) : conserver le **fond rouge existant** (badge/cercle `bg-primary`), passer le **stroke de l'icône** à `text-moroccan-green` (Lucide utilise `currentColor` sur le stroke).
- Icônes **hand-drawn** dans `src/components/landing/icons.tsx` (Hiking, Crafts, Cuisine, Agriculture, Festivals, Homestays) : mêmes règles — le conteneur garde le rouge, le SVG passe en vert (`text-moroccan-green` sur le wrapper).
- Ne touche pas aux icônes hors landing qui ne sont pas sur fond rouge (dashboards, boutons neutres) — la règle « rouge en fond + vert en trait » ne s'applique qu'aux icônes présentées sur un badge/pastille rouge.

## 4. Vérification

- Route `/` : rendu final Hero → WhatIs → MoroccoMap → Experiences → HorizontalGallery → Timeline → Activities → Testimonials → Footer.
- Build TypeScript propre, i18n complet FR/EN/ES/AR, aucune référence morte à Story/HowItWorks/FeaturedRegions.
- Contrôle visuel Playwright (desktop + mobile) : scroll horizontal fonctionne, timeline s'anime, icônes en vert sur fond rouge.
