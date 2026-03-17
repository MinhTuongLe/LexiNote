# LexiNote 📝

**LexiNote** is a modern web application designed to help English learners manage and memorize vocabulary effectively using a **Spaced Repetition System (SRS)**. It combines a clean user interface with powerful learning algorithms to ensure long-term retention of new words.

---

## 🌟 Key Features

### 1. Vocabulary Management
- **Manual Entry:** Add new words with detailed fields (meaning in EN/VI, examples, word types, pronunciation, etc.).
- **Smart Import:** Bulk import vocabulary from `.csv` or `.xlsx` files.
- **Search & Filter:** Easily find words or filter them by type, difficulty, or learning status.

### 2. Learning & Review (SRS)
- **Spaced Repetition:** An intelligent algorithm that schedules reviews based on your performance (Easy, Medium, Hard).
- **Flashcard Mode:** A classic flip-card interface for quick reviews.
- **Quiz Modes:** practice with Multiple Choice, Listening, and Typing exercises (in progress).

### 3. Analytics & Progress
- **Dashboard:** Track your total words, words learned, and daily review targets.
- **Progress Tracking:** Visualize your learning streaks and accuracy over time.
- **Weak Word Identification:** Focus on words you struggle with the most.

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling/Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend
- **Framework:** [Sails.js](https://sailsjs.com/) (Node.js)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** Waterline (Default in Sails)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v22.14 or higher recommended)
- PostgreSQL database

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd LexiNote
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   # Create a .env file and configure your DATABASE_URL
   npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 📂 Project Structure

```text
LexiNote/
├── backend/            # Sails.js API & Database logic
├── frontend/           # Vite + React + TS Application
├── system_design.md    # Detailed system architecture & roadmap
└── README.md           # Project overview
```

---

## 🗺️ Roadmap

- [x] **Phase 1: MVP** - CRUD words, Flashcards, Basic SRS.
- [ ] **Phase 2: Advanced** - Listening mode, Typing mode, Advanced Analytics.
- [ ] **Phase 3: Integration** - Mobile app companion, Google Sheets sync.

---

## 📄 License
This project is for personal use. All rights reserved.
