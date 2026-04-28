# ♟️ Chessin [Development In progress]

A high-performance, real-time multiplayer chess platform built with a focus on low-latency state synchronization and type safety.

## 🚀 Tech Stack

**Core:**

- **Language:** TypeScript (Full-stack)
- **Frontend:** React (Vite), TailwindCSS
- **Backend:** Node.js, Fastify
- **Real-time:** Socket.io (WebSockets)
- **Database:** PostgreSQL / Redis (for caching game states)

**Engine:**

- Stockfish 16 (integrated via UCI protocol) 

## 🏗️ Architecture

This project utilizes a **Monorepo** structure to ensure strict type safety across the network boundary.

- `frontend/`: Client-side UI handles optimistic updates for instant feedback.
- `backend/`: Authoritative server validates moves and manages the persistent game loop.
- `shared/`: Common TypeScript interfaces (`GameState`, `Move`) and validation logic shared by both client and server to prevent "impossible states."

## ✨ Key Features

- **Real-time Multiplayer:** <50ms latency move synchronization.
- **Spectator Mode:** Live broadcasting of active matches.
- **Move Validation:** Dual-layer validation (Client for UI, Server for Security).
- **Engine Analysis:** Integrated Stockfish evaluation for post-game review.


