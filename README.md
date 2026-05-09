<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

# 🛡️ Sentra-AI- Complaint Intelligence Platform

> An intelligent, AI-powered customer complaint management system with real-time sentiment analysis, smart classification, urgency prediction, and a premium dark-themed admin dashboard.

---

## ✨ Features

| Area | Details |
|---|---|
| **🤖 AI Engine** | Sentiment analysis, complaint classification, urgency scoring, and keyword extraction — all running in the browser |
| **📝 Complaint Submission** | Multi-step guided form with real-time validation, category selection, and attachment support |
| **🔍 Complaint Tracking** | Track complaint status via unique ticket ID with a visual timeline |
| **📊 Admin Dashboard** | Executive overview with KPI cards, status breakdowns, and trend charts |
| **📈 Analytics** | Interactive charts (Recharts) for sentiment trends, category distribution, urgency heatmaps, and resolution metrics |
| **🧪 AI Lab** | Interactive playground to test the AI engine — paste text and see live sentiment, category, and urgency predictions |
| **⚙️ Settings** | Profile management, notification preferences, and system configuration |
| **🔐 Authentication** | Admin login & signup with JWT-style session management and route protection |
| **🎨 Design System** | Obsidian dark theme with crimson accents, glassmorphism panels, smooth Framer Motion animations |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite 7 |
| **Styling** | Tailwind CSS 3 + custom design tokens |
| **Routing** | React Router DOM 7 |
| **Animations** | Framer Motion 12 |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **State** | React Context API (Auth, Complaints, Toast) |

---

## 📁 Project Structure

```
AI-COMPLAINT-ANALYZER/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Badge.jsx        # Status & category badges
│   │   ├── Button.jsx       # Primary/secondary/ghost buttons
│   │   ├── Card.jsx         # Glassmorphism card container
│   │   ├── ChartCard.jsx    # Chart wrapper component
│   │   ├── EmptyState.jsx   # Empty data placeholder
│   │   ├── Input.jsx        # Form input with validation
│   │   ├── Loader.jsx       # Animated loading spinner
│   │   ├── Modal.jsx        # Overlay modal dialog
│   │   ├── Navbar.jsx       # Public navigation bar
│   │   ├── RequireAuth.jsx  # Route guard for admin
│   │   ├── Sidebar.jsx      # Admin sidebar navigation
│   │   ├── Table.jsx        # Data table with sorting
│   │   └── Toaster.jsx      # Toast notification system
│   ├── data/                # Mock data & constants
│   │   ├── analytics.js     # Analytics chart data
│   │   ├── complaints.js    # Sample complaints dataset
│   │   └── stats.js         # Dashboard statistics
│   ├── layouts/             # Page layout wrappers
│   │   ├── AdminLayout.jsx  # Sidebar + content layout
│   │   └── PublicLayout.jsx # Navbar + footer layout
│   ├── pages/               # Route-level page components
│   │   ├── AILab.jsx        # AI testing playground
│   │   ├── AdminLogin.jsx   # Admin authentication
│   │   ├── Analytics.jsx    # Analytics dashboard
│   │   ├── Complaints.jsx   # Complaint management table
│   │   ├── Dashboard.jsx    # Executive dashboard
│   │   ├── LandingPage.jsx  # Public landing page
│   │   ├── NotFound.jsx     # 404 error page
│   │   ├── Onboarding.jsx   # User onboarding flow
│   │   ├── Settings.jsx     # Admin settings
│   │   ├── Signup.jsx       # User registration
│   │   ├── SubmitComplaint.jsx  # Complaint submission form
│   │   └── TrackComplaint.jsx   # Complaint tracking page
│   ├── state/               # Context providers
│   │   ├── auth.jsx         # Authentication context
│   │   ├── complaints.jsx   # Complaints state management
│   │   ├── sleep.js         # Async delay utility
│   │   ├── storage.js       # LocalStorage wrapper
│   │   └── toast.jsx        # Toast notification context
│   ├── utils/               # Utility functions
│   │   └── cn.js            # Class name merger
│   ├── App.jsx              # Root router configuration
│   ├── index.css            # Global styles & Tailwind imports
│   └── main.jsx             # Application entry point
├── .gitignore
├── eslint.config.js
├── index.html               # HTML shell
├── LICENSE
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/shoaibakhtar5/AI-COMPLAINT-ANALYZER.git
cd AI-COMPLAINT-ANALYZER

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at **http://127.0.0.1:5173**

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🖥️ Screenshots

| Landing Page | Admin Dashboard | AI Lab |
|---|---|---|
| Dark landing with hero CTA | KPI cards & trend charts | Live sentiment analysis |

---

## 🗺️ Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/submit` | Public | Submit a new complaint |
| `/track` | Public | Track complaint by ticket ID |
| `/onboarding` | Public | User onboarding flow |
| `/signup` | Public | User registration |
| `/admin/login` | Public | Admin login |
| `/admin/dashboard` | 🔒 Admin | Executive dashboard |
| `/admin/complaints` | 🔒 Admin | Complaint management |
| `/admin/analytics` | 🔒 Admin | Analytics & reports |
| `/admin/ai-lab` | 🔒 Admin | AI testing playground |
| `/admin/settings` | 🔒 Admin | System settings |

---

## 🎨 Design System

The app uses a custom **Obsidian Dark** theme with **Crimson** accents:

```
Background:  #141218 (deep obsidian)
Surface:     #1d1b20 (elevated panel)
Border:      #2a2a2a (subtle dividers)
Text:        #f5f5f5 (high contrast)
Crimson:     #dc2626 → #991b1b (primary accent gradient)
```

**Typography**: Space Grotesk (headings) + Inter (body)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Shoaib Akhtar**
- GitHub: [@shoaibakhtar5](https://github.com/shoaibakhtar5)

---

<p align="center">
  Built with ❤️ using React + Vite + Tailwind CSS
</p>
