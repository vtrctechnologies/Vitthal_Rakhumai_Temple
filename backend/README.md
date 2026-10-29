# Vitthal Rakhumai Temple — Backend API

Modular, domain-driven REST API server built with Express and MongoDB.

---

## 📁 Architecture Overview

```
backend/
├── .env.example                 # Reference environment variables
├── .gitignore                   # Ignore rules (excludes uploads/*, .env*)
├── package.json
├── uploads/
│   └── .gitkeep                 # Folder tracked without committing binary uploads
└── src/
    ├── app.js                   # Express application setup & middleware pipeline
    ├── server.js                # Server startup & database connection lifecycle
    │
    ├── routes/
    │   └── api.js               # Centralized /api route aggregator
    │
    ├── shared/                  # Cross-cutting concerns
    │   ├── config/              # db.js, cloudinary.js
    │   ├── middlewares/         # error.middleware.js, upload.middleware.js
    │   └── utils/               # AppError.js, asyncHandler.js, email/sms services
    │
    └── modules/                 # Self-contained domain modules
        ├── auth/                # user.model, auth.controller, auth.routes, auth.middleware
        ├── banner/              # banner.model, banner.controller, banner.routes
        ├── category/            # category.model, category.controller, category.routes
        ├── committee/           # committee.model, committee.controller, committee.routes
        ├── contact/             # contact.model, contact.controller, contact.routes
        ├── donation/            # donation.model, donation.controller, donation.routes
        ├── events/              # events.model, events.controller, events.routes
        ├── gallery/             # gallery.model, gallery.controller, gallery.routes
        ├── guest/               # guest.model, guest.controller, guest.routes
        ├── hero/                # hero.model, hero.controller, hero.routes
        ├── livePrograms/        # live.model, live.controller, live.routes
        ├── notification/        # notification.model, notification.controller, notification.routes
        ├── sports/              # sport.model, sports.controller, sports.routes, registration.model
        └── subscriber/          # subscriber.model, subscriber.controller, subscriber.routes
```

---

## 🌿 Git Branching Strategy & Contribution

To avoid merge conflicts across team members and maintain zero-drift branching:

### Branch Naming Conventions
- `main`: Protected production branch.
- `develop`: Protected staging / integration branch.
- `feat/<module>-<description>`: Feature work (e.g. `feat/sports-rules`, `feat/auth-otp`).
- `fix/<module>-<description>`: Bug fixes (e.g. `fix/gallery-upload-cors`).
- `chore/<description>`: Maintenance & tooling (e.g. `chore/update-deps`).

### Branching Rules
1. **Module Isolation**: Whenever working on a feature, modify only the relevant `src/modules/<feature>` directory. This ensures multiple developers on different branches can merge cleanly without conflict.
2. **Never Commit Media Uploads**: Local file uploads are stored in `backend/uploads/` and are ignored by `.gitignore`.
3. **Verify Before PR**: Always run `npm run check` to verify imports and syntax before pushing or creating a pull request.
4. **Environment Variables**: Add any new environment variables to `.env.example` when adding features.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Cloudinary keys
```

### 3. Run Syntax / Import Check
```bash
npm run check
```

### 4. Start Development Server
```bash
npm run dev
```
