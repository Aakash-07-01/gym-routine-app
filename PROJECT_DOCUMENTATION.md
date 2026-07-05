# Gym Routine Application - Comprehensive Technical Documentation

## 1. Project Overview
The Gym Routine App is a full-stack, AI-powered web application designed to help users create, manage, and track their fitness routines. It stands out by providing dynamic, multi-provider AI insights for workout optimization and seamlessly embedding YouTube tutorials for specific exercises.

The application is deployed on **Render** utilizing a modern cloud-native architecture consisting of a static frontend, a Dockerized backend service, and a managed PostgreSQL database, all orchestrated via Infrastructure as Code (Render Blueprint).

---

## 2. Technology Stack

### **Frontend**
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS v4, PostCSS
- **State Management**: Zustand (Global State)
- **Routing**: React Router DOM v7
- **Animations & UI**: Framer Motion, Lucide React (Icons), React Hot Toast (Notifications)
- **Data Visualization**: Recharts (Charts/Graphs), React Activity Calendar (GitHub-style contribution graphs)
- **Drag & Drop**: @dnd-kit (for reordering exercises)
- **API Communication**: Axios
- **Markdown Parsing**: React Markdown, Remark GFM (for rendering AI responses)

### **Backend**
- **Framework**: Spring Boot 3.4.4 (Java 17)
- **Security**: Spring Security with JWT (JSON Web Tokens)
- **Database Access**: Spring Data JPA / Hibernate
- **Database Migrations**: Flyway
- **Reactive/Web**: Spring Web, Spring WebFlux (for reactive external API calls)
- **Containerization**: Docker (Multi-stage build for optimized image size)

### **Database & Infrastructure**
- **Production Database**: PostgreSQL 16 (Render Managed Database)
- **Local/Test Database**: H2 In-Memory Database
- **Hosting & Deployment**: Render (PaaS)
- **Infrastructure as Code**: `render.yaml` (Blueprint specification)

---

## 3. Core Features & Functionality

### **User Authentication & Security**
- **JWT-Based Auth**: Stateless, secure authentication using signed JSON Web Tokens.
- **Password Hashing**: BCrypt password encoding for secure credential storage.
- **Role-Based Access**: Infrastructure laid out for user roles.

### **Workout Management (Splits, Days, and Exercises)**
- **Workout Splits**: Users can create custom splits (e.g., Push/Pull/Legs, Upper/Lower) or use predefined templates.
- **Workout Days**: Each split contains specific days.
- **Exercises**: Users can add specific exercises to a day, tracking sets, reps, weight, and custom notes.
- **Drag-and-Drop Reordering**: Users can intuitively reorder exercises within a workout day using `dnd-kit`.

### **Workout Tracking & Analytics**
- **Session Logging**: Users can log their completed workouts.
- **Data Export/Import**: Users can export their workout logs as CSV files (via Papaparse) and import existing data.
- **Visualizations**: 
  - Weight progression charts powered by Recharts.
  - Consistency tracking via GitHub-style contribution heatmaps (React Activity Calendar).
- **Personal Records (PRs)**: The system tracks and displays historical PRs for specific exercises.

### **AI-Powered Insights (Multi-Provider Strategy)**
- **Intelligent Feedback**: Users can ask the AI for advice on their current split, suggestions for alternative exercises, or form tips.
- **Fallback Circuit Breaker**: The backend integrates with four different AI providers (Groq, Gemini, Mistral, HuggingFace). If one provider fails or hits a rate limit, the system automatically seamlessly fails over to the next available provider.

### **YouTube Integration**
- **Dynamic Tutorials**: The app automatically fetches the most relevant YouTube tutorial for any given exercise.
- **Smart Caching**: To prevent hitting YouTube Data API quotas, the backend caches video results in the database (`youtube_cache` table) so subsequent requests for the same exercise are served instantly from the database.

---

## 4. Database Schema (PostgreSQL via Flyway)

The database schema is strictly version-controlled using Flyway. 

- `users`: Stores user credentials, IDs, and timestamps.
- `splits`: Represents a workout program belonging to a user (or a global template).
- `workout_days`: Represents a single day within a split.
- `exercises`: Individual movements assigned to a `workout_day`.
- `workout_logs` & `exercise_sessions`: Tracks historical data of when a user completed a day, including exactly how many sets/reps/weight they did.
- `pr_history`: Tracks the historical best lifts (1RM or max weight) for exercises.
- `ai_provider_health`: A critical table used for the AI Circuit Breaker, tracking failure counts and cool-down periods for various LLM APIs.
- `youtube_cache`: Stores exercise names and their corresponding YouTube Video IDs to minimize API calls.

---

## 5. Advanced Technical Implementations

### **1. AI Provider Fallback Mechanism (Circuit Breaker)**
The backend uses a highly resilient Strategy Pattern for AI generation. 
- It implements a custom `AiProvider` interface across multiple services (Groq, Gemini, Mistral, Hugging Face).
- A central `AiRoutingService` checks the `ai_provider_health` database table. If an API key is missing, or an API returns a 429 (Too Many Requests), the router marks that provider as "circuit open" for a specific duration and instantly routes the user's prompt to the next available provider. 

### **2. Efficient Docker Image Build**
The backend `Dockerfile` uses a multi-stage build process.
- **Stage 1 (Build)**: Uses a heavy Maven image to compile the code and build the `.jar` file. Memory limits (`MAVEN_OPTS="-Xmx256m -Xms128m"`) are enforced to prevent Out-Of-Memory (OOM) kills on constrained CI/CD environments.
- **Stage 2 (Run)**: Copies only the compiled `.jar` file into a lightweight Alpine Java image, resulting in a tiny, secure, and fast-booting production image.

### **3. Infrastructure as Code (IaC)**
The `render.yaml` file defines the entire cloud architecture. With a single push, Render automatically spins up the PostgreSQL database, injects the internal database URL securely into the Spring Boot backend, sets up the Docker container, and provisions the static site for the React frontend, handling all networking and CORS automatically.

### **4. Stateless JWT Security Chain**
The Spring Security configuration is completely stateless (`SessionCreationPolicy.STATELESS`). Every incoming request is intercepted by a custom `JwtAuthenticationFilter`, which verifies the token signature, extracts the user ID, and populates the `SecurityContext` without ever storing session data in memory. This makes the backend highly scalable.
