# Preschool Monitoring & Evaluation (M&E) Management System

A full-stack web application for preschool monitoring and evaluation, used by teachers, HODs, and Admins.

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **State Management:** React Hook Form, Zod

## Features

- **Role-Based Access Control (RBAC):** Admin, HOD, and Teacher roles.
- **Teacher Dashboard:** Record daily child observations, save drafts, and submit reports to HOD.
- **HOD Dashboard:** Review, approve, or reject teacher submissions with comments.
- **Admin Dashboard:** Manage users, classes, children, and view system-wide analytics.
- **Daily Reports:** Comprehensive evaluation form including attendance, mood, skills assessment (1-5), and observations.
- **Notifications:** In-app notifications for report status changes.
- **Audit Logs:** Track all system actions for security and compliance.

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database

### 2. Installation

```bash
npm install
```

### 3. Database Setup

Update `.env` with your `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/preschool_me"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Run migrations:

```bash
npx prisma migrate dev --name init
```

### 4. Initial Setup

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000/api/admin/setup` to create the initial admin user and default classes.

- **Default Admin Email:** `admin@school.com`
- **Default Admin Password:** `admin123`

## Workflow

1. **Teacher:** Logs in, selects a child, fills the daily report, and submits it to the HOD.
2. **HOD:** Reviews the report, adds comments, and either approves it or returns it to the teacher for correction.
3. **Admin:** Views all reports, manages the school structure, and generates analytics.

## Deployment

The application is ready for deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Add your environment variables in the Vercel project settings.
3. Vercel will automatically detect Next.js and deploy the application.
