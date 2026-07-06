# GYM-JAM (GymOS) — Your Complete Gym Companion

A full-stack fitness tracking application designed to help you plan, log, and analyze every aspect of your gym journey, powered by an AI orchestration layer.

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## Features

### Workout Management
- **Custom Split Builder** — Design your own workout splits tailored to your goals with drag-and-drop support
- **Workout Templates** — Save and reuse your favourite workout routines
- **Per-Set Logging** — Track weight and reps for every individual set
- **Cardio Tracking** — Log cardio sessions alongside your lifts

### AI Integration & Discovery
- **Weekly Insights** — AI-generated weekly summaries of your progress and training habits
- **AI Chatbot** — Interactive AI assistant integrated via a robust Multi-Provider Circuit Breaker (Groq, Gemini, Mistral, Hugging Face, Pollinations)
- **YouTube Exercise Demos** — Automatically fetch YouTube video recommendations and tutorials for specific exercises

### Progress & Analytics
- **Dashboard** — At-a-glance overview of your fitness journey with interactive charts and GitHub-style contribution heatmaps
- **Personal Records (PRs)** — Dedicated page to track and celebrate your all-time bests
- **Progress Tracking** — Visualise body metrics over time with beautiful Recharts graphs
- **Workout History** — Complete, searchable log of every session with robust CSV export/import (papaparse)

### Daily Notes
- **Workout Notes** — Jot down daily observations, mood, energy levels, and session feedback

### Authentication & Security
- **JWT Authentication** — Secure token-based login and registration (Stateless)
- **Role-Based Access** — Admin panel for user and data management

### Modern UI/UX
- **Glassmorphism Design** — Sleek, modern interface with glass-style aesthetics
- **Bento Grid Layout** — Clean, organised dashboard layout
- **Smooth Animations** — Powered by Framer Motion for a premium feel
- **Fully Responsive** — Works beautifully on desktop and mobile

---

## Tech Stack

| Layer       | Technology                                                     |
| ----------- | -------------------------------------------------------------- |
| **Frontend**  | React 19, Vite, Tailwind CSS v4, Lucide React, Framer Motion, Zustand, React Router v7, React Activity Calendar, Recharts, @dnd-kit, papaparse |
| **Backend**   | Java 17, Spring Boot 3.4.4, Spring Security, Spring Data JPA, WebFlux |
| **Database**  | PostgreSQL (production), H2 (development)                    |
| **Auth**      | JWT (Stateless), BCrypt, Spring Security                                  |
| **Migrations**| Flyway                                                       |
| **Deployment**| Render Blueprint (`render.yaml`) - Managed DB, Web Service, Static Site |

---

## Project Structure

```
gym-routine-app/
├── backend/                  # Spring Boot REST API
│   └── src/main/java/com/gymroutine/backend/
│       ├── ai/               # AI Provider orchestration and Circuit Breaker logic
│       ├── config/           # Security, CORS, app configuration
│       ├── controller/       # REST endpoints
│       ├── dto/              # Data transfer objects
│       ├── model/            # JPA entities
│       ├── repository/       # Spring Data repositories
│       └── service/          # Business logic
├── frontend/                 # React SPA
│   └── src/
│       ├── api/              # Axios API client
│       ├── components/       # Reusable UI components
│       ├── pages/            # Application views
│       ├── store/            # Zustand state management
│       └── assets/           # Static assets
└── mobile/                   # Mobile companion app (WIP)
```

---

## Getting Started

### Prerequisites

- **Java 17+**
- **Node.js 18+**
- **Maven 3.8+**
- **PostgreSQL** (or use H2 for local dev)

### Backend

```bash
cd backend
mvn spring-boot:run
```

The API will start on `http://localhost:8080`. (In local development, the backend automatically uses H2 and a test JWT secret from `application-local.yml`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

For deployment (Render), the following environment variables should be configured via the Render dashboard:

| Variable               | Description                  |
| ---------------------- | ---------------------------- |
| `SPRING_DATASOURCE_URL`| PostgreSQL connection string |
| `SPRING_DATASOURCE_USERNAME`| Database Username       |
| `SPRING_DATASOURCE_PASSWORD`| Database Password       |
| `JWT_SECRET_KEY`       | Secret key for JWT signing   |
| `YOUTUBE_API_KEY`      | YouTube API Key for exercise videos |
| `AI_GROQ_API_KEY`      | Groq API Key                 |
| `AI_GEMINI_API_KEY`    | Gemini API Key               |
| `AI_MISTRAL_API_KEY`   | Mistral API Key              |
| `AI_HUGGINGFACE_API_KEY`| Hugging Face API Key        |
| `VITE_API_URL`         | (Frontend) URL for backend API requests |

---

## Pages Overview

| Page               | Description                                      |
| ------------------ | ------------------------------------------------ |
| **Dashboard**      | Central hub with stats, heatmaps, charts, and AI weekly insights |
| **Routine**        | Active workout session with per-set tracking      |
| **Templates**      | Create, save, and manage workout templates         |
| **Custom Split**   | Build personalised training splits using Drag & Drop |
| **History**        | Browse and search past workout sessions            |
| **Progress**       | Body metrics charts and trend analysis             |
| **PRs**            | Personal records showcase                          |
| **Notes**          | Daily training journal                             |
| **Settings**       | Profile, CSV Data Export/Import, and preference management |
| **Admin**          | User management dashboard (admin only)             |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Author:** Aakash
