# 🗺️ ExpenseLens — Implementation Plan

> AI-powered receipt scanner → auto expense bookkeeper  
> Stack: **Next.js 14 (App Router) + Supabase + AI (provider-agnostic)**

---

## ✅ Final Stack Decisions

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, API routes, file-based routing |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent fintech UI |
| Auth | Supabase Auth | Google OAuth + email/password built-in |
| Database | Supabase (PostgreSQL) | RLS, real-time, managed |
| Storage | Supabase Storage | Signed URLs, secure file access |
| AI — OCR | Google Vision API (default) | Best accuracy; swappable |
| AI — LLM | OpenAI GPT-4o-mini (default) | Cost-effective; swappable |
| Fonts | Inter (Google Fonts) | Clean fintech typography |
| Charts | Recharts | Lightweight, React-native |
| State | Zustand (light) / React Query | Server state + local UI state |

---

## 📁 Project Folder Structure

```
expense-lens/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            ← sidebar + shell
│   │   ├── dashboard/page.tsx    ← summary + charts
│   │   ├── upload/page.tsx       ← drag & drop uploader
│   │   ├── expenses/
│   │   │   ├── page.tsx          ← expense table
│   │   │   └── [id]/page.tsx     ← expense detail
│   │   ├── analytics/page.tsx    ← charts + insights
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── upload/route.ts       ← file → storage → trigger AI
│   │   ├── process/route.ts      ← OCR + LLM pipeline
│   │   └── expenses/route.ts     ← CRUD
│   ├── layout.tsx
│   └── page.tsx                  ← landing page
├── components/
│   ├── ui/                       ← shadcn components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── upload/
│   │   ├── DropZone.tsx
│   │   └── UploadProgress.tsx
│   ├── expenses/
│   │   ├── ExpenseTable.tsx
│   │   ├── ExpenseCard.tsx
│   │   └── ExpenseDetail.tsx
│   ├── analytics/
│   │   ├── CategoryPieChart.tsx
│   │   ├── SpendingTrendChart.tsx
│   │   └── InsightCard.tsx
│   └── dashboard/
│       └── SummaryCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← browser Supabase client
│   │   └── server.ts             ← server Supabase client
│   ├── ai/
│   │   ├── index.ts              ← AI service facade (provider-agnostic)
│   │   ├── ocr/
│   │   │   ├── interface.ts      ← IOCRProvider interface
│   │   │   └── google-vision.ts  ← Google Vision impl
│   │   └── llm/
│   │       ├── interface.ts      ← ILLMProvider interface
│   │       └── openai.ts         ← OpenAI impl
│   └── utils.ts
├── types/
│   └── index.ts                  ← shared TypeScript types
├── middleware.ts                  ← auth-protected routes
└── .env.local
```

---

## 🗄️ Database Schema (Supabase SQL)

### `users` (managed by Supabase Auth — `auth.users`)
Extended via a `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `receipts`
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  status TEXT DEFAULT 'processing', -- processing | done | failed
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `expenses`
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
  merchant TEXT,
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  category TEXT,
  date DATE,
  raw_text TEXT,
  confidence NUMERIC(3,2), -- optional: AI confidence score 0-1
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "own_data" ON profiles USING (auth.uid() = id);
CREATE POLICY "own_data" ON receipts USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON expenses USING (auth.uid() = user_id);

-- Storage Policies for 'receipts' bucket
-- 1. Allow authenticated users to upload files to their own folder
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Allow users to view their own files
CREATE POLICY "Allow users to view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 🧠 AI Pipeline Design (Provider-Agnostic)

### Interface Contracts

```typescript
// lib/ai/ocr/interface.ts
export interface IOCRProvider {
  extractText(fileBuffer: Buffer, mimeType: string): Promise<string>;
}

// lib/ai/llm/interface.ts
export interface ILLMProvider {
  structureExpense(rawText: string): Promise<StructuredExpense>;
}

export type StructuredExpense = {
  merchant: string;
  amount: number;
  currency: string;
  date: string;        // ISO 8601
  category: ExpenseCategory;
  confidence?: number;
};

export type ExpenseCategory =
  | 'Food & Beverage'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Other';
```

### AI Service Facade (Swappable via Config)

```typescript
// lib/ai/index.ts
import { GoogleVisionOCR } from './ocr/google-vision';
import { OpenAILLM } from './llm/openai';

const ocrProvider = new GoogleVisionOCR(process.env.GOOGLE_VISION_API_KEY!);
const llmProvider = new OpenAILLM(process.env.OPENAI_API_KEY!);

export async function processReceipt(fileBuffer: Buffer, mimeType: string) {
  const rawText = await ocrProvider.extractText(fileBuffer, mimeType);
  const expense  = await llmProvider.structureExpense(rawText);
  return { rawText, expense };
}
```

> 🔌 To swap providers: only change the import line. Business logic stays untouched.

### LLM Prompt Design (Critical for Accuracy)

```
You are a financial data extraction assistant.
Extract the following from this receipt text and return ONLY valid JSON:

{
  "merchant": string,
  "amount": number,
  "currency": "USD" | "PKR" | "EUR" | ...,
  "date": "YYYY-MM-DD",
  "category": "Food & Beverage" | "Transport" | "Shopping" | "Bills" | "Entertainment" | "Other"
}

Rules:
- If a field cannot be determined, use null
- Amount must be a number (no currency symbols)
- Date must be ISO 8601
- Category must be exactly one of the provided options

Receipt text:
{RAW_TEXT}
```

---

## 🚀 Implementation Phases

### Phase 1 — Project Bootstrap (Day 1)
- [ ] `npx create-next-app@latest ./ --typescript --tailwind --app --eslint`
- [ ] Install: `@supabase/supabase-js`, `@supabase/ssr`, `shadcn/ui`, `recharts`, `react-dropzone`, `zustand`
- [ ] Configure `.env.local` (Supabase URL + anon key + API keys)
- [ ] Initialize shadcn/ui
- [ ] Set up Supabase project → run schema SQL → enable RLS
- [ ] Configure `middleware.ts` for auth route protection

### Phase 2 — Auth System (Day 1–2)
- [ ] Landing page (`/`) — hero, features, CTA
- [ ] Login page (`/login`) — email/pass + Google OAuth button
- [ ] Signup page (`/signup`)
- [ ] Supabase Auth callbacks (`/auth/callback/route.ts`)
- [ ] `middleware.ts` → redirect unauthenticated users
- [ ] Dashboard shell: sidebar + top bar layout

### Phase 3 — File Upload System (Day 2–3)
- [ ] `DropZone.tsx` — drag & drop, file type validation (jpg/png/pdf)
- [ ] Upload page UI
- [ ] `POST /api/upload` route:
  - Upload file to Supabase Storage (`receipts/{user_id}/{uuid}`)
  - Create `receipts` row with `status: 'processing'`
  - Trigger `/api/process` (async, non-blocking)
  - Return receipt ID immediately
- [ ] `UploadProgress.tsx` — poll receipt status, show processing state

### Phase 4 — AI Processing Pipeline (Day 3–4)
- [ ] Implement `GoogleVisionOCR` (`lib/ai/ocr/google-vision.ts`)
- [ ] Implement `OpenAILLM` (`lib/ai/llm/openai.ts`) with structured prompt
- [ ] `POST /api/process` route:
  - Fetch file from Supabase Storage
  - Run OCR → get raw text
  - Run LLM → get structured JSON
  - Save to `expenses` table
  - Update `receipts.status` to `'done'`
- [ ] Error handling: mark `status: 'failed'`, surface error to UI

### Phase 5 — Expense Dashboard (Day 4–5)
- [ ] `GET /api/expenses` — paginated, filterable by date/category/merchant
- [ ] `ExpenseTable.tsx` — sortable columns, pagination
- [ ] Filter bar: date range picker, category dropdown, search input
- [ ] `ExpenseDetail` page (`/expenses/[id]`):
  - Show merchant, amount, category, date
  - Show original receipt image (Supabase signed URL)
  - Show raw extracted text
  - Allow category edit (manual override)

### Phase 6 — Analytics Dashboard (Day 5–6)
- [ ] Monthly total spend summary card
- [ ] `CategoryPieChart.tsx` — Recharts pie chart by category
- [ ] `SpendingTrendChart.tsx` — Recharts line chart (last 30 days)
- [ ] Top merchants list
- [ ] Insight strings: "You spent 34% on food this month"
- [ ] Month selector

### Phase 7 — Settings + Export (Day 6–7)
- [ ] Currency selection (stored in `profiles.currency`)
- [ ] Export expenses as CSV (client-side generation)
- [ ] Delete account flow
- [ ] Profile display (email, member since)

---

## 🔐 Security Checklist

- [x] RLS enabled on all tables
- [x] Supabase signed URLs for file access (not public URLs)
- [x] Server-side Supabase client for API routes (uses service role only where needed)
- [x] Auth middleware protects all `/dashboard/*` routes
- [x] API routes validate `session` before processing

---

## ⚡ Performance Strategy

| Goal | Strategy |
|---|---|
| Dashboard load < 1s | Server Components + cached Supabase queries |
| Upload processing async | Fire-and-forget `/api/process`, poll status |
| AI call < 10s | OCR + LLM in parallel where possible |
| Charts fast | Aggregate data server-side, send minimal JSON |

---

## 📅 7-Day Build Schedule

| Day | Focus |
|---|---|
| Day 1 | Bootstrap + Supabase setup + Auth pages + Landing page |
| Day 2 | Dashboard shell + Upload UI + Supabase Storage integration |
| Day 3 | AI pipeline (OCR + LLM) + `/api/process` route |
| Day 4 | Expense list page + filters + expense detail view |
| Day 5 | Analytics dashboard + charts + insight strings |
| Day 6 | Settings page + CSV export + polish |
| Day 7 | Testing + RLS audit + deployment (Vercel) |

---

## 🔑 Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Providers
GOOGLE_VISION_API_KEY=
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ❓ Open Questions / Decisions Needed

1. **AI Provider Priority**: Start with Google Vision + OpenAI GPT-4o-mini, or use a vision-capable model (GPT-4o) that does OCR + structuring in one call? (Simpler but pricier)
2. **Free tier limits**: Should the MVP include a usage quota (e.g., 10 free uploads/month) or be fully open?
3. **PDF handling**: PDFs need special treatment (convert to image first via `pdf2pic` or send directly to Vision API). Confirm if PDF support is needed in MVP.
4. **Currency**: Single currency (USD) for MVP or multi-currency from day 1?

