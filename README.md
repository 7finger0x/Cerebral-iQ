# Cerebral iQ: Next-Gen Cognitive Assessment

Cerebral iQ is a clinical-grade, distributed cognitive assessment platform designed for the 2026 professional and research landscape. Built upon the **Cattell-Horn-Carroll (CHC)** theory of intelligence, it utilizes **Item Response Theory (IRT)** to deliver highly accurate, adaptive testing with ultra-low friction.

![Cerebral iQ Preview](https://via.placeholder.com/1200x600/0a0510/6366f1?text=Cerebral+iQ+Next-Gen+Platform)

## 🏗️ Architecture

The platform is built as a decoupled, high-performance system:

- **Frontend**: Next.js 15 (React 19), Tailwind CSS v4, Framer Motion.
- **Backend**: FastAPI (Python 3.14), IRT Engine (`catsim`), NumPy, SciPy.
- **Infrastructure**: Supabase (Auth/Database), Vercel/Docker Deployment.

## ✨ Core Features

- **Adaptive IRT Engine**: Real-time item selection based on Maximum Fisher Information.
- **Deviation IQ Scoring**: Standardized results (M=100, SD=15) benchmarked against WAIS-IV norms.
- **Glassmorphism UI**: A premium, clinical-authority "Thumb-Reach" design optimized for accessibility and engagement.
- **Canvas-based Matrix Hook**: High-performance interactive elements designed for peak cognitive engagement above the fold.
- **Multi-Dimensional Dashboard**: Comprehensive visualization of 7 CHC domains using Recharts.

## 📂 Project Structure

```text
/
├── frontend/          # Next.js 15 Frontend
│   ├── app/           # App Router & Layouts
│   ├── components/    # Reusable UI & Assessment Modules
│   └── lib/           # Supabase & API Clients
└── backend/           # FastAPI Psychometric Engine
    ├── main.py        # API Entrypoint
    ├── psychometrics/ # IRT Scoring & Selection logic
    └── models/        # Item Bank with IRT Parameters (a, b, c)
```

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- Python 3.10+
- Supabase Project

### Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Verified By VibeCheck ✅*
