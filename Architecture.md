description: System architecture, data flow, and deployment model for the Nosana Agents 102 Challenge project.
globs:
  alwaysApply: true
---

# ARCHITECTURE.md

## 📌 Project Architecture: Nosana Agents 102 Challenge
This document describes the architecture of our **Nosana Agents 102 Challenge** project.  
It covers the system overview, component responsibilities, data flow, deployment model, and key architectural decisions.

---

## 1. System Overview
The application is a **full-stack AI agent system** featuring:

- **MCP Server** → Exposes domain-specific tools and resources.  
- **Mastra AI Agent** → Orchestrates reasoning, dynamic prompting, and tool usage.  
- **Next.js Frontend** → Provides an interactive, real-time UI for users.  
- **Live Synchronization Layer** → Keeps frontend state in sync with agent actions.  
- **Deployment on Nosana Network** → Containerized services running in a distributed environment.

Domains implemented:
1. **Code Review Assistant** (primary, enterprise-focused).  
2. **IoT Device Controller** (secondary, creative extension).  

---

## 2. Component Responsibilities

### MCP Server
- Implements the **Model Context Protocol**.  
- Provides **custom tools**:  
  - Code Review: `repo_scan`, `diff_review`, `lint_check`.  
  - IoT: `device_status`, `device_command`.  
- Stateless, composable, and resilient (timeouts, retries, logging).

### Mastra Agent
- Handles **reasoning and orchestration**.  
- Uses **dynamic prompts** tailored to each domain.  
- Selects and sequences MCP tools.  
- Maintains **context awareness** (session memory).  
- Includes **evaluation harness** for correctness.

### Next.js Frontend
- Built with **App Router** and **Server Components**.  
- **Code Review UI:** Repo explorer, diff viewer, inline comments.  
- **IoT UI:** Device dashboard with status indicators and toggles.  
- Uses **shadcn/ui** for consistent styling.  
- Responsive and accessible (mobile-first).

### Live Synchronization
- Event bus implemented with **Server-Sent Events (SSE)** or **WebSockets**.  
- Streams agent actions and resource updates to the frontend in real time.  
- Ensures UI reflects backend state instantly.

### Deployment
- All services containerized (Docker).  
- Deployed on **Nosana Network** for distributed execution.  
- Environment variables managed via `.env.local`.  
- CI/CD pipeline ensures reproducible builds.

---

## 3. Data Flow

```mermaid
flowchart TD
    User[User Interaction] -->|UI Input| Frontend[Next.js Frontend]
    Frontend -->|Request| Agent[Mastra Agent]
    Agent -->|Tool Call| MCP[MCP Server]
    MCP -->|Executes Tool| Resources[Code Repo / IoT Devices]
    Resources --> MCP
    MCP --> Agent
    Agent -->|Response| Frontend
    Agent -->|Events| Sync[Live Sync Layer]
    Sync --> Frontend
    Frontend -->|Real-time Update| User
