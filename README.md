# 🎓 College Academic Planner & Study Assistant

A premium, local-first academic organization dashboard and productivity suite tailored specifically for college students. Built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**, this application features a vibrant glassmorphic UI, offline data persistence, calendar synchronization, and a context-aware AI Study Assistant named **Shiv**.

🚀 **Live Demo:** [https://academic-planner-pi.vercel.app](https://academic-planner-pi.vercel.app)

---

## ✨ Features

### 1. 📊 Dashboard & Semester GPA Estimator
* **Academic Analytics**: Tracks your assignment completion rates, daily study streaks, and logs focus hours.
* **Vibrant Charts**: Integrated with **Recharts** to visualize progress trends over the last 14 days and study hours breakdown per subject.
* **Weighted GPA Calculator**: Automatically estimates your cumulative Semester GPA on a standard 4.0 scale, weighted by course credit hours.
* **Welcome Hero**: Personalized greetings based on custom user profiles.

### 2. 📚 College Course Management
* **Course Profiles**: Add courses with specialized fields: Course Code, Credit Hours, Expected Grade, Professor Name, Professor Email, and Office Hours/Room.
* **Professor Contact Hub**: Click-to-email shortcuts and office hours tracking visible directly on individual subject cards.
* **Curriculum Progress**: Dynamic progress bars show completion percentages per subject based on associated assignments.

### 3. 📅 Interactive Study Calendar
* **Weekly Grid Layout**: Plan and track specific study sessions (planned, completed, or skipped).
* **iCal/Google Calendar Sync**: Export all scheduled sessions and exams as an RFC 5545-compliant `.ics` file for easy calendar import.
* **Print / PDF Layout**: Custom print stylesheets hide navigation panels and formatting, adapting the calendar grid to fit perfectly on standard paper or save as a PDF.

### 4. 📝 Notes, Exams, & Syllabus Directory
* **Notes Workspace**: Create and search lecture notes, link them to courses, and attach note PDFs (saved locally as base64 data URLs).
* **Exam Tracker**: Displays upcoming quizzes, midterms, and finals with dynamic countdowns and a Master Datesheet PDF launcher.
* **Syllabus Manager**: Store, upload, and read course syllabi files to stay ahead of the curriculum.

### 5. 🔗 Study Resources Hub
* **Reference Portal**: Save website bookmarks, books, articles, and video resources associated with specific courses or categorized as general references.
* **Seeded Tools**: Pre-populated with popular academic resources (Wikipedia, Wolfram Alpha, Khan Academy, and Quizlet).

### 6. 🤖 Context-Aware AI Study Assistant ("Shiv")
* **Interactive Console**: Keyless LLM chat powered by Pollinations AI that acts as a friendly peer and professor.
* **Dashboard Context Integration**: Shiv reads your real-time planner stats, notes text, syllabus contents, and upcoming assignments to give highly customized advice.
* **Study Techniques**: Explains scientific learning strategies (Feynman Technique, Active Recall, Pomodoro, Spaced Repetition).
* **Quick Tools**: Clickable shortcuts to "Quiz Me" (generates mock quizzes based on your course notes), "Plan My Day" (generates study schedules based on assignment deadlines), or "Explain Concept".
* **Local Fallback Engine**: Fully functional offline local pattern-matching engine to answer queries about GPA, deadlines, and study tips when disconnected.

---

## 🛠️ Technology Stack

* **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite 8](https://vite.dev/)
* **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Charts**: [Recharts 3](https://recharts.org/)
* **Calendar Exports**: RFC 5545 `.ics` generator
* **LLM Integration**: Pollinations AI (OpenAI-compatible client-side fetch)

---

## 💾 Data Architecture & Offline First

This application is **fully client-side and privacy-respecting**. 
* All subjects, assignments, calendar slots, notes, syllabus pages, and files are stored locally in the browser's `localStorage` via a React Context API wrapper ([AppContext.tsx](file:///Users/shivgupta/Desktop/Academic%20Planner/src/contexts/AppContext.tsx)).
* PDF attachments are converted to **Base64 Data URLs** and saved locally (up to 1.5MB per file).
* Settings page includes **Backup / Restore** buttons to export all data to a JSON file and load it back later.

---

## ⚙️ Installation & Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/shivgupta272007-dotcom/Academic_Planner.git
   cd Academic_Planner
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```
   This generates compiled, minified static files under `dist/` ready to be hosted on Vercel, Netlify, or GitHub Pages.

---

## 📦 Deployment Configuration

The repository is pre-configured for **Vercel** with a [vercel.json](file:///Users/shivgupta/Desktop/Academic%20Planner/vercel.json) file supporting single-page routing (SPA).

To deploy using Vercel CLI:
```bash
npx vercel --prod
```
