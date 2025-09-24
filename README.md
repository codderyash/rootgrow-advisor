# rootgrow-advisor

A modern web application built with Vite, React, TypeScript, Tailwind CSS, and shadcn-ui. This is the front-end (advisor) component of the RootGrow project.

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)
* [Development](#development)
* [Deployment](#deployment)
* [Configuration](#configuration)
* [Folder Structure](#folder-structure)
* [Future Improvements](#future-improvements)
* [License & Contribution](#license--contribution)

---

## Features

* Interactive UI using **React + TypeScript**
* Styled with **Tailwind CSS** + **shadcn-ui**
* Fast build & dev experience via **Vite**
* Easy domain setup & deployment
* Environment configuration via `.env` file

---

## Tech Stack

* **Vite** — development server & bundler
* **TypeScript** — type-safe JavaScript
* **React** — UI library
* **Tailwind CSS** — utility-first styling
* **shadcn-ui** — UI component library
* Other configs: ESLint, PostCSS, etc.

---

## Getting Started

1. Clone this repository:

```bash
git clone https://github.com/codderyash/rootgrow-advisor.git
cd rootgrow-advisor
```

2. Install dependencies:

```bash
npm install
```

3. Setup environment:

* Copy `.env.example` (if exists) to `.env`
* Fill necessary variables (API keys, base URLs, etc.)

4. Run the development server:

```bash
npm run dev
```

The app should now be available at `http://localhost:3000`.

---

## Development

* Use your preferred IDE (VSCode, WebStorm, etc.)
* TypeScript catches type errors early
* Hot reloading updates the UI instantly
* Linting and formatting via ESLint / Prettier
* Add new pages/components under `src/`

---

## Deployment

This project can be deployed via **Lovable** or any static hosting that supports Vite builds.

* **With Lovable**

  * Go to Lovable → Share → Publish
  * Configure custom domain under *Project > Settings > Domains*

* **Manual Deployment**

  * Run `npm run build` to generate production assets
  * Serve the `dist/` folder via any static hosting (Netlify, Vercel, etc.)

---

## Configuration & Environment

* `.env` file is used to store secrets, API base URLs, etc.
* Make sure to **not** commit `.env` to version control
* Example variables might include:

```
VITE_API_URL=https://api.rootgrow.com
VITE_SUPABASE_URL=…
VITE_SUPABASE_KEY=…
```

* Tailwind / PostCSS configs are in root (`tailwind.config.ts`, `postcss.config.js`)
* TypeScript config in `tsconfig.json`

---

## Folder Structure

```
root
├── public/              # Static assets (favicon, icons, etc.)
├── src/                 # Source code (components, pages, utils)
├── supabase/            # Supabase integration / config files
├── .env                 # Environment variables
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig*.json
├── package.json
└── README.md
```

---

## Future Improvements

* Add authentication (sign up, login)
* Role-based access (advisor, admin, etc.)
* More UI pages: dashboard, reports, settings
* State management (React Context, Redux, Zustand)
* Testing (unit, integration)
* CI/CD integration
* Internationalization (i18n)

---

## License & Contribution

* This project currently has no license — choose one (MIT, Apache, etc.)
* Contributions are welcome!

  * Fork the repo
  * Create a feature branch
  * Open a pull request with description & tests (if applicable)
