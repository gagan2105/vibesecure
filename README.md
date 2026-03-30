# 🛡️ VibeSecure — AI-Powered DevSecOps Platform

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://vibesecure-three.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933)](https://nodejs.org/)

**VibeSecure** is a high-performance, professional-grade code security analysis tool designed for modern DevSecOps workflows. It leverages advanced Large Language Models (LLMs) to perform deep-tissue security audits, architectural mapping, and dependency vulnerability checks in seconds.

## 🚀 Live Demo
Check out the platform in action: **[vibesecure-three.vercel.app](https://vibesecure-three.vercel.app)**

---

## ✨ Key Features

- **🔍 AI-Powered Security Audit**: Scans source code for OWASP Top 10 vulnerabilities, including SQL Injection, XSS, SSRF, and hardcoded secrets.
- **📊 Intelligence Dashboard**: Real-time security scoring (0-100) with letter grades (A-F) and actionable fix recommendations.
- **🗺️ Architecture Visualization**: Automatically maps your codebase into interactive system diagrams, identifying components and structural concerns.
- **📦 Dependency Audit**: Real-time npm package vulnerability checks against global CVE databases.
- **🧠 Complexity Metrics**: Analyzes cyclomatic complexity, cognitive load, and maintainability to ensure code quality.
- **🔐 Firebase-Secured**: Multi-modal authentication (Google OAuth / Email) with secure session management.
- **🔌 Multi-Input Support**: Analyze code via direct paste, public Git repository URL, or local ZIP file upload.

---

## 🏗️ Architecture Overview

The system is built on a high-fidelity, event-driven architecture that prioritizes speed and security.

![VibeSecure Architecture](./vibesecure_architecture_viz_1774783297238.png)

### Technology Stack
- **Frontend**: React 18, Vite, Framer Motion (for animations), Recharts (data visualization), Firebase SDK.
- **Backend**: Node.js, Express, OpenRouter API (Claude-3 / GPT-4o), Simple-Git (for repository cloning), Adm-Zip.
- **Security**: Firebase Authentication, Rate-limiting, In-memory processing (no code is stored after analysis).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Firebase Project (for Authentication)
- OpenRouter API Key (for Analysis)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gagan2105/vibesecure.git
   cd vibesecure
   ```

2. **Install all dependencies**
   We've provided a helper script to install both frontend and backend dependencies at once:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**

   **Backend (`/backend/.env`):**
   ```env
   PORT=3001
   OPENROUTER_API_KEY=your_key_here
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=...
   ```

   **Frontend (`/frontend/.env`):**
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

---

## 🏃 Running Locally

To start both the frontend and backend in development mode:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3001`.

---

## 🛡️ Security & Privacy
VibeSecure is built with a "Privacy First" mindset. 
- **Volatile Processing**: Source code is processed in temporary memory and is **never** persisted to a database.
- **Temporary Extraction**: Git repos and Zip files are extracted to temporary OS directories and wiped immediately after analysis completes.
- **Encrypted Auth**: All user sessions are handled by Firebase's industry-standard authentication protocols.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Built with ❤️ by [Gagan](https://github.com/gagan2105)
