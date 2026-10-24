# 🧾 ExpenseLens

> **AI-Powered Receipt Scanner & Automated Expense Bookkeeper**  
> Turn messy paper and digital receipts into organized, categorized expenses and actionable financial insights in seconds.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Aim & Objectives](#aim--objectives)
- [Key Features](#key-features)
- [How It Works (AI Pipeline)](#how-it-works-ai-pipeline)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Database Schema & Security](#database-schema--security)
- [Sustainable Development Goals (SDGs)](#sustainable-development-goals-sdgs)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Roadmap](#project-roadmap)
- [License](#license)

---

## 🔍 Overview

**ExpenseLens** eliminates manual bookkeeping by utilizing an automated dual-stage AI pipeline. Users upload receipts (images or PDFs), and ExpenseLens automatically reads the text, extracts key financial entities (merchant, total amount, currency, transaction date), categorizes the purchase, and records it directly into a personal finance dashboard with real-time analytics.

---

## ⚠️ Problem Statement

Manual receipt tracking and expense logging are tedious, repetitive, and error-prone. Individuals and small business owners frequently misplace receipts, delay record-keeping, and lose visibility over their day-to-day spending. Without automated data extraction, creating budgets, managing taxes, and tracking cash flow becomes frustrating and inefficient.

---

## 🎯 Aim & Objectives

### Project Aim
To develop an automated, intelligent expense tracking system that converts raw receipt images into structured, categorized financial records, delivering friction-free bookkeeping and spending analytics in real time.

### Objectives
1. **Intelligent Ingestion Pipeline**: Ingest receipts via drag-and-drop or mobile upload and perform high-precision Optical Character Recognition (OCR).
2. **Contextual Information Extraction & Categorization**: Use Large Language Models (LLMs) to structure raw text into structured JSON fields (Merchant, Date, Amount, Currency, Category).
3. **Secure & Isolated Storage**: Store receipt assets and expense ledgers securely with PostgreSQL Row-Level Security (RLS) and signed access URLs.
4. **Interactive Financial Insights**: Provide users with visual dashboards (category distribution, 30-day trends, top merchants) and CSV export options.

---

## ✨ Key Features

- **⚡ Instant Receipt Upload**: Drag-and-drop interface supporting JPG, PNG, and PDF files.
- **🤖 Dual-Stage AI Processing**:
  - **OCR Stage**: Extracts raw text blocks from images using Google Cloud Vision.
  - **LLM Semantic Parsing**: Parses unstructured text into clean JSON schema using OpenAI GPT models.
- **🏷️ Automated Categorization**: Automatically tags purchases (Food & Beverage, Transport, Shopping, Bills, Entertainment, Other).
- **📊 Real-Time Analytics Dashboard**:
  - Total monthly spend overview.
  - Spending distribution pie charts.
  - 30-day expenditure trend line charts.
  - Top merchant breakdowns and contextual spending insights.
- **🔒 Enterprise-Grade Security**:
  - Authentication via Supabase Auth (Email/Password & Google OAuth).
  - PostgreSQL Row-Level Security (RLS) ensuring strict user data isolation.
  - Secure signed URLs for private receipt image storage.
- **📁 Data Export**: Export structured expense reports to CSV for tax preparation or spreadsheets.

---

## 🧠 How It Works (AI Pipeline)

```
[ User Uploads Receipt ]
          │
          ▼
[ Supabase Storage (Private Bucket) ]
          │
          ▼
[ Google Cloud Vision OCR ] ──► Raw Text Extracted
          │
          ▼
[ OpenAI LLM (Structured JSON Extraction) ]
  • Merchant Name
  • Total Amount & Currency
  • Transaction Date (ISO 8601)
  • Category Classification
          │
          ▼
[ Supabase Database (RLS Enforced) ]
          │
          ▼
[ Dashboard & Interactive Charts ]
```

---

## 🏗️ System Architecture & Folder Structure

```
expense-lens/
├── app/
│   ├── (auth)/                # Authentication routes (Login, Signup)
│   ├── (dashboard)/           # Protected user routes (Dashboard, Upload, Expenses, Analytics, Settings)
│   ├── api/                   # API Route Handlers (Upload, Process, Expense CRUD)
│   ├── auth/                  # Supabase OAuth callbacks
│   ├── globals.css            # Tailwind & theme styles
│   ├── layout.tsx             # Root application layout
│   └── page.tsx               # Product landing page
├── components/
│   ├── analytics/             # Recharts visualizations (Pie, Trend, Insights)
│   ├── expenses/              # Expense data tables, filters, and detail cards
│   ├── landing/               # Landing page hero, interactive demo, and feature blocks
│   ├── layout/                # Sidebar, TopBar, and dashboard navigation
│   ├── ui/                    # Reusable UI primitives (shadcn / Tailwind)
│   └── upload/                # Drag-and-drop dropzone & upload progress
├── lib/
│   ├── ai/                    # Provider-agnostic AI facade (OCR & LLM interfaces)
│   │   ├── ocr/               # Google Cloud Vision integration
│   │   └── llm/               # OpenAI extraction integration
│   ├── supabase/              # Browser and server Supabase clients
│   └── utils.ts               # Formatting and utility functions
├── public/                    # Static assets & icons
├── design.md                  # Landing page and UI design system specifications
├── plan.md                    # Technical implementation roadmap and database schema
└── package.json               # Dependencies and scripts
```

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Server Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Authentication** | [Supabase Auth](https://supabase.com/auth) (Email + Google OAuth) |
| **Database & Storage** | [Supabase PostgreSQL](https://supabase.com/database) (RLS) & [Supabase Storage](https://supabase.com/storage) |
| **AI / Machine Learning** | [Google Cloud Vision API](https://cloud.google.com/vision) (OCR), [OpenAI API](https://openai.com/) (LLM Parsing) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |

---

## 🗄️ Database Schema & Security

ExpenseLens relies on Supabase PostgreSQL with strict **Row-Level Security (RLS)**:

- **`profiles`**: Stores user settings, email, and preferred default currency.
- **`receipts`**: Stores uploaded receipt file paths, upload status (`processing`, `done`, `failed`), and timestamps.
- **`expenses`**: Structured financial records linked to receipts (merchant, amount, currency, category, date, confidence score).

All tables and storage buckets enforce `auth.uid() = user_id` policies so users can only access their own data.

---

## 🌍 Sustainable Development Goals (SDGs)

- **SDG 8: Decent Work & Economic Growth** — Automates mundane clerical bookkeeping, enabling freelancers, creators, and small business owners to focus on growth.
- **SDG 9: Industry, Innovation & Infrastructure** — Demonstrates practical application of modern cloud and AI infrastructure to modernize everyday financial operations.
- **SDG 12: Responsible Consumption & Production** — Promotes a paperless receipt culture, reducing thermal paper waste and encouraging intentional spending habits.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17+ or 20+
- npm, yarn, pnpm, or bun
- A Supabase project account
- Google Cloud Vision API Key
- OpenAI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahmedraza032/expense-lens.git
   cd expense-lens
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Services
   GOOGLE_VISION_API_KEY=your_google_cloud_vision_key
   OPENAI_API_KEY=your_openai_api_key

   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run database migrations:**
   Execute the schema SQL queries provided in [plan.md](plan.md) within your Supabase SQL Editor.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Project Roadmap

- [x] Initial Next.js App Router bootstrap with Tailwind CSS and TypeScript
- [x] Landing page design with live interactive mock demo
- [x] Supabase Auth, database schema, and RLS policies setup
- [x] Multi-format receipt upload component (DropZone)
- [x] Provider-agnostic AI processing pipeline (OCR + LLM)
- [x] Expense listing, filtering, and detail modal view
- [x] Spending analytics and category visualization with Recharts
- [ ] Multi-currency conversion support
- [ ] Export to PDF / QuickBooks integration
- [ ] Mobile PWA receipt capture camera support

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
