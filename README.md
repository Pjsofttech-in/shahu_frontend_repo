# Shri Shahu Prabodhini — Admin Panel

React (Vite) admin frontend for the Shri Shahu Prabodhini school/Sankalp Exam system,
built to talk to your existing Spring Boot backend.

## Setup

```bash
npm install
npm run dev        # uses .env.development -> proxies /api to http://localhost:8080
npm run build       # uses .env.production -> keep /api for same-origin deployment
npm run preview     # preview the production build locally
```

## Before you run it

1. **Update `.env.production`** with your real live API domain.
2. **Check `src/api/services.js`** — every endpoint path is mapped to match the
   controllers you shared (`/api/districts`, `/api/talukas`, `/api/centers`,
   `/api/coordinators`, `/users`, `/api/gallery`). A few paths are my best
   assumption where no controller was shared yet and need to be confirmed/added
   on the backend:
   - `POST /api/auth/login` — admin login, expected to return `{ token, admin }`
   - `GET /api/auth/me` — optional, current admin profile
   - `POST /api/files/upload` — multipart upload, expected to return `{ url }`
   - `/api/students`, `/api/toppers`, `/api/testimonials`, `/api/faculty`,
     `/api/awards`, `/api/courses`, `/api/downloads`
   - `/api/website/footer`, `/api/website/vision-mission`, `/api/website/contact`
     (GET + PUT, singleton — one row, not a list)
   - `/api/sankalp/syllabus`, `/api/sankalp/answer-keys`,
     `/api/sankalp/results`, `/api/sankalp/result-pdfs`
3. **Confirm field names** returned by each entity (e.g. `districtName` vs
   `district.name` on a Taluka) — table `render()` functions already check both,
   but double-check against your actual DTOs.
4. **Student registration fields** (`src/pages/students/Students.jsx`) were
   built from a standard school-registration template since the specific
   reference screenshot wasn't included in the upload — adjust the `fields`
   array to match your exact form.
5. **Website content fields** (Gallery, Toppers, Testimonials, Faculty, Awards,
   Courses, Footer, Vision & Mission, Contact) are similarly built to a
   sensible standard shape — adjust field names to match your DTOs/entities.

## Project structure

```
src/
  api/
    axiosConfig.js     # axios instance, token interceptor, dev/prod base URL
    services.js         # all API calls, generic CRUD factory
  context/
    AuthContext.jsx      # login/logout state
  components/
    layout/               # Sidebar, Topbar, Layout shell
    common/                # DataTable, Modal, FormField, CrudManager, SingletonForm, ProtectedRoute
  pages/
    Login.jsx, Dashboard.jsx, Profile.jsx
    settings/              # Districts, Talukas, Centers, Coordinators
    students/               # Students
    website/                 # Footer, Gallery, Toppers, Testimonials, Faculty,
                              # Awards, VisionMission, Courses, Downloads, ContactUs
    sankalp/                  # Syllabus, AnswerKey, ResultCheck, ResultPdf
```

## How the CRUD pages work

Every list-style page (Districts, Gallery, Students, Syllabus, etc.) is built on
top of one reusable component: `CrudManager`. You give it a `service` (from
`services.js`), `columns` for the table, and `fields` for the add/edit form —
it handles loading, search, the modal, create/update/delete, and cascading
dropdowns (e.g. Taluka's District selector, Center's District→Taluka selector)
automatically. Singleton pages (Footer, Vision & Mission, Contact Us) use
`SingletonForm` instead, since those are a single row (GET + PUT), not a list.

To add a brand-new module later, copy an existing page in `pages/website/` or
`pages/settings/` as a template — most of the work is just defining `columns`
and `fields`.
