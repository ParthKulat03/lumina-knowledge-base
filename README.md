# Lumina — AI Document Knowledge Base

Lumina is an AI-powered document search assistant.  
Upload PDFs or text files, and then **chat with your own knowledge** using semantic search + RAG (Retrieval-Augmented Generation).

The app has:

- A modern dashboard UI for uploading and managing documents
- A chat interface that answers questions using only your uploaded files
- Vector search over chunked document embeddings (Cohere)
- Supabase for auth, storage, and Postgres (with pgvector)
- Groq LLM for fast, high-quality answers

---

## ✨ Features

- **Secure login & profiles** with Supabase Auth  
- **Document uploads** with status badges (`processing` → `ready`)  
- **Background indexing**:
  - Extract text from PDFs / text files
  - Chunk into 1024-dim vectors using Cohere embeddings
  - Store chunks in a `document_chunks` table with pgvector
- **Semantic search**:
  - Embed user query with Cohere
  - Find similar chunks using a `match_chunks` Postgres function
  - Feed only matched chunks into Groq LLM (RAG)
- **Chat UI**:
  - Clean, sticky header and input bar
  - Automatic scroll-to-bottom
  - Copy answer button with “Copied!” animation
  - Like / dislike buttons stored in local UI state
- **Documents UI**:
  - Upload modal with drag & drop support
  - Progress bar during upload / indexing
  - Auto-refresh of document status (processing → ready)
  - Delete documents (removes from DB + filesystem + chunks)

---

## 🧱 Tech Stack

**Frontend**

- React + TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- Zustand for client-side stores (`auth-store`, `settings-store`, `rag-store`)

**Backend**

- Node.js + Express + TypeScript
- Supabase (Postgres + Auth + pgvector)
- Cohere Embeddings API (1024-dim vectors)
- Groq Chat Completions API (`llama-3.1-8b-instant` or similar)
- `multer` for file uploads
- `pdf-parse` for PDF text extraction

---

## 📂 Project Structure (simplified)

```text
.
├─ client/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ layout/
│  │  │  │  ├─ DashboardLayout.tsx
│  │  │  │  └─ Sidebar.tsx
│  │  │  └─ auth/ProtectedRoute.tsx
│  │  ├─ lib/
│  │  │  ├─ auth-store.ts
│  │  │  ├─ rag-store.ts
│  │  │  ├─ settings-store.ts
│  │  │  └─ supabaseClient.ts
│  │  ├─ pages/
│  │  │  ├─ search.tsx
│  │  │  ├─ documents.tsx
│  │  │  ├─ settings.tsx
│  │  │  ├─ auth/login.tsx
│  │  │  └─ auth/signup.tsx
│  │  └─ App.tsx
│  └─ index.html
│
├─ server/
│  ├─ index.ts           # Express + Vite dev server hookup
│  ├─ routes.ts          # API routes (search, upload, delete)
│  ├─ static.ts          # Static file serving in production
│  ├─ storage.ts         # File path helpers
│  ├─ supabaseClient.ts  # Supabase admin client
│  └─ uploads/           # Uploaded files (ignored in Git)
│
├─ shared/
│  └─ schema.ts          # Shared types / schemas
│
├─ .env                  # Environment variables (not committed)
├─ package.json
├─ tsconfig.json
└─ README.md
