# Sabor a Campo - Next.js Project

## Project Overview
Next.js application with TypeScript, Tailwind CSS, MongoDB, Firebase, and PDF generation capabilities.

## Tech Stack
- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Auth & JWT
- **Storage**: Cloudinary for media, Firebase Storage
- **Notifications**: SweetAlert2, React-Toastify
- **Forms**: React Hook Form
- **PDF Generation**: PDFKit
- **Environment**: dotenv

## Project Structure
```
src/
├── app/          # Next.js App Router
│   ├── api/      # API Routes (users, pdf, cloudinary)
│   ├── layout.tsx
│   └── page.tsx
├── components/   # React components
├── lib/          # Config files (mongodb, firebase, jwt, auth)
├── models/       # Mongoose models
└── utils/        # Helper functions
```

## Development Guidelines
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Keep environment variables in `.env.local`
- Use React Hook Form for form handling
- Implement proper error handling with toasts
- Use SweetAlert2 for important confirmations
- MongoDB connections are cached globally
- JWT tokens are stored in httpOnly cookies
- All API routes should return NextResponse

## Key Files
- `.env.local` - Environment variables (never commit)
- `src/lib/mongodb.ts` - Database connection
- `src/lib/auth.ts` - Authentication helpers
- `src/utils/alerts.ts` - SweetAlert2 functions
- `README.md` - Complete documentation
- `QUICKSTART.md` - Quick start guide

## Available APIs
- `GET/POST /api/users` - User CRUD
- `POST /api/pdf` - Generate PDFs
- `POST /api/cloudinary/delete` - Delete images
