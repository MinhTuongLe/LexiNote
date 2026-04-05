<div align="center">

# 📝 LexiNote

**An Open-Source, Intelligent Vocabulary Management Platform**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](#)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](#)

[Demo (Coming Soon)](#) · [Report Bug](https://github.com/MinhTuongLe/LexiNote/issues) · [Request Feature](https://github.com/MinhTuongLe/LexiNote/issues)

</div>

<br/>

**LexiNote** is a modern, full-stack web application designed to help English learners manage and memorize vocabulary efficiently. By integrating a scientifically-proven **Spaced Repetition System (SRS)**, interactive flashcards, and rich analytics, LexiNote ensures long-term retention of new words with minimal daily effort.

---

## ✨ Features

- 🧠 **Smart Spaced Repetition**: Intelligent algorithm that schedules reviews optimizing your memory retention.
- 📦 **Bulk Imports**: Effortlessly import `.csv` or `.xlsx` files to bootstrap your vocabulary list.
- 🔐 **Secure Authentication**: End-to-end user authentication with JWT, email verification, and secure password recovery.
- 📊 **Insightful Analytics**: Real-time dashboard tracking daily goals, total words learned, and review accuracy rates.
- 🌍 **Internationalization (i18n)**: Out-of-the-box support for English and Vietnamese interfaces.
- 🎮 **Gamified Learning**: Multiple study modes including standard flashcards, typing tests, and matching games.
- 🌓 **Dynamic Theming**: Beautifully crafted Light/Dark UI built with TailwindCSS and Framer Motion.

---

## 🏗 System Architecture

The project is structured as a monolithic repository (monorepo format) splitting logic between an advanced backend and a highly responsive frontend.

### Frontend
- **Framework:** React 19 + TypeScript powered by Vite.
- **State Management:** Redux Toolkit (RTK Query) for resilient API data fetching.
- **Styling:** TailwindCSS + Framer Motion.
- **i18n:** `i18next` for robust localization.

### Backend
- **Framework:** NestJS (Express under-the-hood).
- **Database ORM:** Prisma Client v7+.
- **Database Engine:** PostgreSQL (Supabase/Neon integrations).
- **Security:** Passport.js (JWT strategies), `@nestjs/throttler`, CORS & Helmet.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v22.14 or later)
- [Yarn](https://yarnpkg.com/) or npm
- PostgreSQL database instance

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/MinhTuongLe/LexiNote.git
   cd LexiNote
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   yarn install
   # Copy .env.example to .env and configure variables
   yarn dev
   ```

3. **Backend Setup**
   ```bash
   cd ../backend
   yarn install
   # Create a .env file and set your DATABASE_URL, JWT_SECRET, etc.
   yarn db:push     # Synchronize Prisma schema with DB
   npx prisma generate
   yarn start:dev
   ```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please refer to our [Contributing Guidelines](CONTRIBUTING.md) for standard commit flows, and read our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🗺️ Roadmap

- [x] Integrate NestJS Backend Architecture.
- [x] Initial React + Tailwind Frontend with RTK.
- [x] Word imports and Spaced Repetition Logic.
- [ ] Implement Audio Pronunciation integration (TTS).
- [ ] Mobile companion app via React Native.
- [ ] Open API exposure for 3rd-party community integrations.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">Made with ❤️ by Le Minh Tuong</p>
