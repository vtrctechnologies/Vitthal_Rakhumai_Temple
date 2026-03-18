# VR_Temple — Shree Vitthal Rakhumai Temple Website

This repository contains the source for the Shree Vitthal Rakhumai Temple website. The site shares information about the temple, upcoming events, photo galleries, donation options, and contact details for devotees and visitors.

This README focuses on the website's purpose, main pages, features, and how to run or edit the site locally.

## Website overview

- **Title:** Shree Vitthal Rakhumai Temple (Amberkarwadi)
- **Purpose:** Provide information about the temple, publicize events and festivals (for example: Kartiki Ekadashi), host a gallery of photos, and offer a way for visitors to donate and contact temple organizers.
- **Audience:** Devotees, visitors, and community members.

Key features implemented in the site:

- Hero section with festival highlight and call-to-action buttons (Donate, View Events).
- About section describing the temple's location and heritage.
- Events listing and highlighted event sections (`/events`).
- Photo gallery (`/gallery`) using images stored in `public/gallery/`.
- Donation page with form or links to support construction and activities (`/donation`).
- Contact page with contact form and location details (`/contact`).

## Main pages and components

- `Home` (`/`) — Hero, about summary, events highlight, gallery glimpse, and quick actions.
- `Events` (`/events`) — Full list of upcoming and past events.
- `Gallery` (`/gallery`) — Image grid and gallery viewer (uses images from `public/gallery/`).
- `Donation` (`/donation`) — Donation options and form (or external checkout integration).
- `Contact` (`/contact`) — Contact form and address details.
- UI primitives and shared components are in `src/components/ui/` (Radix + Tailwind wrappers).

## Run locally

Requirements:

- Node.js v16+ (recommended)
- npm (or `pnpm`/`yarn`)

Install and start the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (default Vite port) in your browser.

Build for production:

```bash
npm run build
npm run preview
```

## Editing site content

- Hero images and large site images are in `src/assets/` and `public/gallery/`.
  - Replace `src/assets/temple-hero.jpg` and `src/assets/temple-main.png` with your own images (keep similar aspect ratios for best results).
  - Add gallery images to `public/gallery/` and they will be picked up by the gallery components.
- Event data is managed in `src/components/EventsSection.jsx` and `src/pages/Events.jsx`. Edit those files to change descriptions, dates, or add new events.
- Text content for pages lives in the corresponding files under `src/pages/` (for example `Home.jsx`, `About.jsx`, `Contact.jsx`).

## Styling and components

- Tailwind CSS is used for styling. See `tailwind.config.js` to adjust theme, colors, and content paths.
- The site uses Radix primitives and small shadcn-style wrappers in `src/components/ui/` for accessible building blocks.

## Assets and media

- Public gallery images: `public/gallery/` (place `temple-1.jpg`, `temple-2.jpg`, ...)
- Other site images: `src/assets/` (temple hero, panorama, icons, etc.)

## Deployment

Deploy to any static host supporting Vite builds (Vercel, Netlify, GitHub Pages). Typical settings:

- Build command: `npm run build`
- Publish/output directory: `dist`

On Vercel you can connect the repository and use the same build command; Vercel will automatically detect the framework.

## Troubleshooting

- If you encounter dependency issues:

```bash
rm -rf node_modules package-lock.json
npm install
```

- If many files change due to line endings on Windows, normalize them with:

```bash
git add --renormalize .
git commit -m "Normalize line endings"
```

## Contributing

- Create a branch for your change: `git checkout -b feat/my-change`
- Run the dev server locally and test UI changes.
- Open a pull request and include screenshots for visual changes.

## Contact

If you need help maintaining the site, or want to suggest content changes, update `src/pages/Contact.jsx` with the best contact details and maintainers can be reached from there.

---

If you'd like, I can now:

- Start the dev server and confirm the site loads in this environment.
- Add a short `CONTRIBUTING.md` or `DEPLOY.md` with step-by-step deployment for Vercel/Netlify.
- Create sample gallery images in `public/gallery/` to demo the gallery.

Tell me which you'd like next.
