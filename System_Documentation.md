# VRTEMPLE System Documentation

Comprehensive technical guide for the VRTEMPLE platform, covering architecture, APIs, filtering logic, and media management.

---

## 1. System Architecture

VRTEMPLE is a robust MERN (MongoDB, Express, React, Node.js) platform designed for high-performance content delivery and management.

- **Frontend (Website)**: Public showcase for gallery, events, sports, and donations. Use `getImageUrl` for all assets.
- **Admin Dashboard**: Secure management interface. Restricted via JWT and Admin-only routes.
- **Backend API**: Stateless RESTful API. Handles authentication, file uploads, and data persistence.

---

## 2. API Filtering Logic (Detailed)

### **Gallery**
- **Category Filter**: `?category=[slug/id]`
- **Query Logic**: Resolves identifier to MongoDB `_id` using `resolveCategory` helper.
- **Sorting**: Matches `order` (Ascending) then `createdAt` (Descending).
- **Video Detection**: Automatically detects `/video/` in Cloudinary URLs to switch from `<img>` to `<video>`.

### **Sports**
- **Year-wise Detailing**: `?year=[int]` (e.g., `2024`). Filters by exact year match.
- **Status Filter**: `?active=[true/false/all]`. Defaults to `true` (Active).
- **Database Query**: `Sport.find(query).populate("createdBy").lean()`
- **Winner Logic**: Supports `?position=[first/second/third]` filtering for sport winners.

### **Live Programs**
- **Year Filter**: `?year=[int]`. Essential for archiving old festivals and programs.
- **Category Filter**: `?category=[id]`. Filters by festival or event type.
- **Live Status**: `?live=true`. Filters currently streaming programs (`isLive: true`).
- **Sorting**: Uses primary `year` (DESC) and secondary `startTimestamp` (DESC).

---

## 3. Comprehensive Route & Query Map

### **Authentication (`/api/auth`)**
| Method | Route | Description | Backend Logic |
|---|---|---|---|
| POST | `/login` | Admin login | Compares bcrypt hashes; returns JWT. |
| GET | `/me` | Session check | Decodes JWT; returns admin profile. |

### **Gallery Module (`/api/gallery`)**
| Method | Route | Description | Key Query |
|---|---|---|---|
| GET | `/images` | Public Gallery | `{ isActive: true, category: req.query.category }` |
| GET | `/images/admin/all` | Admin List | Fetches all, including inactive items. |
| POST | `/images` | Create Item | Multer-Cloudinary stream; stores URL + Public ID. |
| GET | `/categories` | Get Categories | `{ isActive: true }` sorted by `order`. |

### **Sports & Winners (`/api/sports`)**
| Method | Route | Description | Key Query |
|---|---|---|---|
| GET | `/` | All Sports | `{ year: req.query.year || currentYear }` |
| GET | `/years` | List All Years | `Sport.distinct("year")` |
| GET | `/:id/winners` | Sport Winners | Filters `SportWinner` by `sport_id` and `isActive`. |
| POST | `/:id/winners` | Upsert Winner | Custom `processTeamMembers` logic for captains. |

### **Live Programs (`/api/live-programs`)**
| Method | Route | Description | Key Query |
|---|---|---|---|
| GET | `/` | All Programs | `{ year: req.query.year, category: req.query.category }` |
| GET | `/years` | Live Years | `LiveProgram.distinct("year")` sorted DESC. |

---

## 4. Media Handling (Images & Videos)

For all image and video uploading, the platform uses **Multer** and **Cloudinary**.

- **Upload Limit**: 50MB (Supports large videos).
- **Supported Formats**: Common images (`jpg, png, webp`) and videos (`mp4, mov, avi`).
- **Cloudinary Storage**: Assets are organized into subfolders (e.g., `vr-temple/gallery`).

---

## 5. Directory Mapping

- `backend/src/models`: Schemas define data structure (GalleryImage, Sport, Winner, Admin).
- `backend/src/controllers`: Business logic (filtering, sorting, processing team members).
- `backend/src/middleware`: `protect` (Auth) and `errorMiddleware` (Global safety).
- `frontend/src/utils/imageUrl`: Centralized asset construction.
- `admin/src/services/api`: Axios wrappers for every backend route.
