# CIMS Campus LMS

A web-based Learning Management System for CIMS Campus — academic structure, module content, semester registration, payments, and approvals across Super Admin, Administrator/Staff, Lecturer, Finance Staff, Registrar/Academic Staff, and Student roles.

Stack: Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui, Prisma + PostgreSQL, Auth.js (credentials, RBAC), Cloudinary (file storage), Resend (email).

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and other secrets
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See `/docs` in the repo (if present) or the project plan for architecture details.
