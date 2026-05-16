📄 PRD — ExpenseLens Landing Page
1. Overview
🎯 Purpose

The ExpenseLens landing page is designed to:

instantly communicate the product value
demonstrate AI automation in action
convert visitors into signups
build trust through simplicity and clarity
🧠 Core Message

“Turn receipts into tracked expenses automatically using AI.”

💥 Primary Goal

Convert first-time visitors into:

signed-up users
or demo users
⚡ Design Philosophy
minimal but powerful
motion-enhanced clarity (not decoration)
focus on “1 idea per screen”
no clutter, no noise
2. Target Audience
👥 Visitors:
students
salaried professionals
small business owners
productivity/finance-conscious users
🧠 Visitor mindset:
“I don’t want to track expenses manually”
“Show me how this works in seconds”
“Is this actually useful?”
3. Landing Page Structure (Core Sections)
🧭 3.1 Hero Section (MOST IMPORTANT)
🎯 Goal:

Instantly communicate value in <5 seconds.

📌 Layout:

Centered minimal hero with soft gradient background.

🧠 Content:
Headline:

“Your receipts. Organized automatically.”

Subheading:

“Upload a receipt. Get a fully categorized expense in seconds—powered by AI.”

Primary CTA:
“Try ExpenseLens Free”
Secondary CTA:
“Watch 10s Demo”
🎨 Visual Element:

A real-time animated mock upload flow:

drag receipt → AI processes → expense appears
✨ Animations:
fade-in headline (300ms)
subtle upward float on CTA
smooth typing animation for subtext
micro-glow effect on upload card
💡 Key UX rule:

User must understand product WITHOUT reading everything.

🧾 3.2 Live Demo Section (High Engagement Block)
🎯 Goal:

Show product value immediately.

📌 Layout:

Split section:

Left:

upload box (interactive mock)

Right:

live generated expense preview
⚙️ Interaction:

User drags a sample receipt:
👉 animation triggers AI processing state

Then:

“Extracting data…”
“Categorizing expense…”
“Done ✔”
Output shown:
Merchant
Amount
Category
Date
✨ Animations:
loading shimmer skeletons
smooth state transitions
fade between steps (no abrupt changes)
📊 3.3 Problem Section (Pain Awareness)
🎯 Goal:

Make user feel the pain before solution.

Headline:

“Manual expense tracking is broken.”

Content Cards:
Card 1:
“You forget to log expenses”
Card 2:
“Receipts get lost in chats and pockets”
Card 3:
“Spreadsheets are too slow to maintain”
Design:
3 minimal cards
soft border
hover lift animation
Motion:
cards appear on scroll (staggered fade-in)
🤖 3.4 How It Works Section
🎯 Goal:

Explain in 3 steps only.

Steps:
1. Upload Receipt

“Take a photo or upload file”

2. AI Processes It

“Extracts merchant, amount, category”

3. Track Automatically

“Everything organized in your dashboard”

Design:

Horizontal stepper OR vertical scroll animation

Motion:
line connecting steps animates on scroll
icons gently scale in
📊 3.5 Features Section (Minimal but powerful)
🎯 Goal:

Highlight value, not list features.

Features:
🧠 AI Extraction

“No manual entry required”

📊 Smart Categorization

“Understand where your money goes”

⚡ Instant Insights

“See spending trends automatically”

Design:
icon + short text only
no long paragraphs
Motion:
hover glow effect
subtle tilt on hover
📈 3.6 Analytics Preview Section
🎯 Goal:

Show “future value” of product.

Content:

Mock dashboard preview:

monthly spending chart
category breakdown
top merchants
Design:
glassmorphism card style
blurred background grid
Motion:
chart animates on scroll
numbers count up animation
🔐 3.7 Trust Section
🎯 Goal:

Reduce hesitation.

Content:
“Your data is private”
“Stored securely with Supabase”
“No manual input required”
Design:
very minimal text
small lock icon animation
🚀 3.8 Final CTA Section
🎯 Goal:

Convert user.

Headline:

“Start tracking expenses without tracking expenses.”

CTA:
“Get Started Free”
Design:
dark contrast section
centered layout
strong visual focus
Motion:
CTA pulse glow every few seconds (subtle)
4. UI/UX Design System
🎨 Design Style
minimal fintech aesthetic
soft gradients
lots of whitespace
rounded corners (12–16px radius)
glass-like UI panels
🎨 Color System
Primary: Indigo / Blue
Accent: Emerald Green
Background: Off-white / soft gray
Dark mode optional
🖋 Typography
Font: Inter / Geist
Big bold headlines
small clean body text
5. Motion & Animation System
✨ Principles:
motion should guide attention
never distract
always subtle and fast (200–500ms)
Animations:
Page load:
fade-in + slight upward motion
Scroll:
staggered reveal
parallax subtle background shift
Buttons:
hover scale (1.02)
soft glow
Cards:
lift + shadow increase on hover
6. Technical Implementation (Next.js)
🧱 Stack:
Frontend:
Next.js (App Router)
Tailwind CSS
Framer Motion (animations)
shadcn/ui (components)
Optional:
GSAP (advanced animation control)
Lottie (micro animations)
⚙️ Structure:
/app
landing page
/components
Hero
DemoUpload
Features
Steps
AnalyticsPreview
CTA
7. Performance Requirements
Lighthouse score: 95+
First load < 2s
animations optimized (GPU-based transforms)
lazy-loaded sections
8. Success Metrics

Landing page success is measured by:

CTA click rate
scroll depth (>75%)
demo interaction rate
signup conversion
🧠 Final Product Feel

When done correctly, the landing page should feel like:

“I understood what this does in 5 seconds, and I want to try it immediately.”

Not:

reading-heavy
feature overload
confusing SaaS jargon