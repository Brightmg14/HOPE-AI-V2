# HopeCare AI 2.0

A community-centred healthcare information and appointment support demonstration for The Hope Exchange, South Africa.

## Features

- Beneficiary portal and staff administration dashboard
- English, Afrikaans and isiXhosa language selection
- Simulated multilingual healthcare assistant
- Browser speech-to-text input and spoken replies, with support fallbacks
- Appointment, medication reminder and announcement management
- LocalStorage persistence
- Clinic analytics and CSV export
- Responsive desktop, tablet and mobile layouts

## Run locally

```bash
npm install
npm run dev
```

Open the address shown by Vite, usually `http://localhost:5173`.

## Demo access

This demonstration does not require authentication.

- Choose **Continue as Beneficiary** to open the beneficiary portal.
- Choose **Continue as Staff** to open the clinic administration dashboard.

All names, appointments, messages and contact details are fictional.

## Build

```bash
npm run build
npm run preview
```

The production Vite base path is `/HopeAI/` for GitHub Pages.

## Deployment

The workflow at `.github/workflows/deploy.yml` builds and deploys the `dist` folder when changes are pushed to `main`. It can also be triggered manually.

Before deploying, enable GitHub Pages in repository settings and set the source to **GitHub Actions**.

## Demo limitations

- The chatbot uses curated, simulated responses.
- SMS and WhatsApp reminders are simulated.
- Voice features depend on browser Web Speech API support and microphone permission. Recognized speech appears in the question field for review before sending.
- LocalStorage is not a secure database or shared backend.
- The app is not production authentication and should not be used for real medical records or decisions.

## Reset demo data

Use **Reset demo data** on the welcome page or staff settings page. This restores the fictional seeded records.

## Project structure

- `src/App.tsx` - application shell and all portal pages
- `src/App.css` - responsive interface styles
- `src/data.ts` - fictional demo records
- `src/storage.ts` - LocalStorage data management
- `src/translations.ts` - interface translations
- `src/index.css` - global design tokens
N