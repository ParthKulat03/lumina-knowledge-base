import type { Express } from "express";
import { type Server } from "http";
import path from "path";
import fs from "fs";
import multer from "multer";
import Groq from "groq-sdk";
import { supabaseAdmin } from "./supabaseClient";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse: (data: Buffer) => Promise<{ text: string }> = require("pdf-parse");

const upload = multer({
  dest: path.join(process.cwd(), "server/uploads"),
});


// ---------- Helpers ----------

function cosineSimilarity(a: number[], b: number[]): number {
  const dim = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;

  for (let i = 0; i < dim; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }

  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function extractTextFromFile(fullPath: string): Promise<string> {
  const ext = path.extname(fullPath).toLowerCase();
  const buffer = fs.readFileSync(fullPath);

  if (ext === ".pdf") {
    try {
      const data = await pdfParse(buffer);
      if (data.text && data.text.trim().length > 0) {
        return data.text;
      }
    } catch (err) {
      console.error("pdf-parse failed, falling back to raw text:", err);
    }
  }

  return buffer.toString("utf8");
}

type DbChunk = {
  page_number: number;
  chunk_index: number;
  text: string;
};

function chunkTextForDb(
  fullText: string,
  chunkSize = 2000,
  overlap = 200
): DbChunk[] {
  const cleaned = fullText.replace(/\r\n/g, "\n").trim();
  if (!cleaned) return [];

  const chunks: DbChunk[] = [];
  let start = 0;
  let index = 0;
  const len = cleaned.length;

  while (start < len) {
    const end = Math.min(len, start + chunkSize);
    const slice = cleaned.slice(start, end).trim();

    if (slice.length > 0) {
      chunks.push({
        page_number: 1 + Math.floor(index / 5), 
        chunk_index: index,
        text: slice,
      });
      index++;
    }

    if (end === len) break;
    start = end - overlap;
  }

  return chunks;
}

type CohereInputType = "search_document" | "search_query";

async function cohereEmbedV2(
  texts: string[],
  inputType: CohereInputType
): Promise<number[][]> {
  if (!texts.length) return [];

  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error("Missing COHERE_API_KEY in backend .env");

  const inputs = texts.map((t) => ({
    content: [
      {
        type: "text",
        text: t.slice(0, 4000),
      },
    ],
  }));

  const resp = await fetch("https://api.cohere.com/v2/embed", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "embed-english-v3.0",
      input_type: inputType,
      embedding_types: ["float"],
      inputs,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error("Cohere v2 embed error:", resp.status, txt);
    throw new Error("Cohere v2 embed request failed");
  }

  const json: any = await resp.json();
  const vectors: number[][] = json?.embeddings?.float ?? [];
  return vectors;
}

async function embedDocuments(texts: string[]): Promise<number[][]> {
  return cohereEmbedV2(texts, "search_document");
}

async function embedQueryToVector(query: string): Promise<number[]> {
  const [vec] = await cohereEmbedV2([query], "search_query");
  return vec;
}

async function startDocumentIndexing(doc: { id: string; stored_path: string }) {
  try {
    const fullPath = path.join(process.cwd(), doc.stored_path);
    if (!fs.existsSync(fullPath)) {
      console.warn("Stored file missing on disk:", fullPath);
      await supabaseAdmin
        .from("documents")
        .update({ status: "error" })
        .eq("id", doc.id);
      return;
    }

    console.log("📄 Extracting text for:", doc.id);
    const text = await extractTextFromFile(fullPath);

    console.log("✂ Chunking text...");
    const chunks = chunkTextForDb(text);
    if (!chunks.length) {
      console.warn("No text extracted for doc", doc.id);
      await supabaseAdmin
        .from("documents")
        .update({ status: "ready" })
        .eq("id", doc.id);
      return;
    }

    const BATCH_SIZE = 90;
    const allRows: any[] = [];

    console.log(`🧠 Embedding ${chunks.length} chunks...`);

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((c) => c.text);
      const vectors = await embedDocuments(texts);

      batch.forEach((c, idx) => {
        allRows.push({
          doc_id: doc.id,
          page_number: c.page_number,
          chunk_index: c.chunk_index,
          text: c.text,
          embedding: vectors[idx],
        });
      });
    }

    const { error: chunkError } = await supabaseAdmin
      .from("document_chunks")
      .insert(allRows);

    if (chunkError) {
      console.error("Failed to insert document_chunks:", chunkError);
      await supabaseAdmin
        .from("documents")
        .update({ status: "error" })
        .eq("id", doc.id);
      return;
    }

    await supabaseAdmin
      .from("documents")
      .update({ status: "ready" })
      .eq("id", doc.id);

    console.log("✅ Document indexed:", doc.id);
  } catch (err) {
    console.error("❌ Background index error:", err);
    await supabaseAdmin
      .from("documents")
      .update({ status: "error" })
      .eq("id", doc.id);
  }
}

// ================================================================
// ROUTE REGISTRATION
// ================================================================
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/documents", async (req, res) => {
    const userId = req.query.userId as string | undefined;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    try {
      const { data, error } = await supabaseAdmin
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase GET documents error:", error);
        return res.status(500).json({ error: "Failed to load documents" });
      }

      res.json(data);
    } catch (err) {
      console.error("GET /api/documents error:", err);
      res.status(500).json({ error: "Failed to load documents" });
    }
  });

  // -------- POST /api/documents/upload ----------
  app.post(
    "/api/documents/upload",
    upload.single("file"),
    async (req, res) => {
      try {
        const userId = req.body.userId as string | undefined;
        if (!userId) {
          return res.status(400).json({ error: "Missing userId" });
        }
        if (!req.file) {
          return res.status(400).json({ error: "Missing file" });
        }

        const file = req.file;
        const ext = path.extname(file.originalname);
        const storedPath = `/server/uploads/${file.filename}${ext}`;
        const fullPath = path.join(process.cwd(), storedPath);

        fs.renameSync(file.path, fullPath);

        const { data: doc, error: insertError } = await supabaseAdmin
          .from("documents")
          .insert({
            user_id: userId,
            file_name: file.originalname,
            stored_path: storedPath,
            size_bytes: file.size,
            status: "processing",
          })
          .select()
          .single();

        if (insertError || !doc) {
          console.error("Supabase insert error:", insertError);
          return res.status(500).json({ error: "Failed to save document" });
        }

        startDocumentIndexing({ id: doc.id, stored_path: storedPath }).catch(
          (err) => console.error("Indexing error:", err)
        );

        return res.json({ success: true, doc });
      } catch (err) {
        console.error("UPLOAD error:", err);
        res.status(500).json({ error: "Upload failed" });
      }
    }
  );

  // -------- POST /api/documents/delete ----------
  app.post("/api/documents/delete", async (req, res) => {
    try {
      const { docId } = req.body as { docId?: string };
      if (!docId) return res.status(400).json({ error: "Missing docId" });

      const { data, error } = await supabaseAdmin
        .from("documents")
        .select("*")
        .eq("id", docId)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: "Document not found" });
      }

      const fullPath = path.join(process.cwd(), data.stored_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

      await supabaseAdmin.from("document_chunks").delete().eq("doc_id", docId);
      await supabaseAdmin.from("documents").delete().eq("id", docId);

      res.json({ success: true });
    } catch (err) {
      console.error("DELETE document error:", err);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // ================================
  // RAG SEARCH - Cohere (1024-d) + Groq LLM, with debug logs
  // ================================
  app.post("/api/search", async (req, res) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

    try {
      const { query, userId, topK: clientTopK } = req.body as {
        query: string;
        userId: string;
        topK?: number;
      };

      if (!query || !userId) {
        return res.status(400).json({ error: "Missing query or userId" });
      }

      const topK = clientTopK ?? 5;

      console.log("📩 /api/search called");
      console.log("➡ Query:", query);
      console.log("➡ UserID:", userId);

      const { data: docs, error: docsError } = await supabaseAdmin
        .from("documents")
        .select("id, file_name, status")
        .eq("user_id", userId)
        .eq("status", "ready");

      if (docsError) {
        console.error("❌ Supabase documents error:", docsError);
        return res.status(500).json({ error: "Failed to load documents" });
      }

      console.log("📄 Docs count:", docs?.length ?? 0);

      if (!docs || docs.length === 0) {
        return res.json({
          answer:
            "I couldn't find any indexed content for your documents yet. Try uploading a document first.",
          sources: [],
        });
      }

      const docIds = docs.map((d) => d.id);
      const docNameById: Record<string, string> = {};
      for (const d of docs) {
        docNameById[d.id] = d.file_name;
      }

      const { data: chunks, error: chunksError } = await supabaseAdmin
        .from("document_chunks")
        .select("doc_id, page_number, chunk_index, text, embedding")
        .in("doc_id", docIds);

      if (chunksError) {
        console.error("❌ Supabase document_chunks error:", chunksError);
        return res.status(500).json({ error: "Failed to load chunks" });
      }

      console.log("🧩 Chunks count from Supabase:", chunks?.length ?? 0);
      if (chunks && chunks.length > 0) {
        console.log(
          "🧩 Sample chunk:",
          JSON.stringify(chunks[0]).slice(0, 200),
        );
      }

      if (!chunks || chunks.length === 0) {
        return res.json({
          answer:
            "I couldn't find any indexed chunks for your documents. Try re-uploading them.",
          sources: [],
        });
      }

      const toEmbeddingArray = (raw: any): number[] | null => {
        if (!raw) return null;

        if (Array.isArray(raw)) {
          return raw.map((v) => Number(v));
        }

        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              return parsed.map((v) => Number(v));
            }
          } catch (_e) {
            return null;
          }
        }

        return null;
      };

      console.log("🧠 Getting query embedding...");
      const queryEmbedding = await embedQueryToVector(query);
      console.log("🧠 Query embedding length:", queryEmbedding.length);

      type Match = {
        doc_id: string;
        page_number: number | null;
        chunk_index: number | null;
        text: string;
        similarity: number;
      };

      const matches: Match[] = [];

      for (const c of chunks as any[]) {
        const emb = toEmbeddingArray(c.embedding);
        if (!emb || emb.length === 0) continue;

        const sim = cosineSimilarity(queryEmbedding, emb);
        matches.push({
          doc_id: c.doc_id,
          page_number: c.page_number,
          chunk_index: c.chunk_index,
          text: c.text,
          similarity: sim,
        });
      }

      console.log("✅ Matches with valid embeddings:", matches.length);

      if (matches.length > 0) {
        const sims = matches
          .map((m) => m.similarity)
          .sort((a, b) => b - a)
          .slice(0, 5);
        console.log("📈 Top 5 similarity scores:", sims);
      }

      if (matches.length === 0) {
        console.warn("⚠ No valid embeddings found for any chunk.");
        return res.json({
          answer:
            "I couldn't find relevant information in your uploaded documents for that question. Please ask something that clearly relates to them.",
          sources: [],
        });
      }

      matches.sort((a, b) => b.similarity - a.similarity);

      const THRESHOLD = 0.05;
      const filtered = matches.filter((m) => m.similarity >= THRESHOLD);
      const topMatches = (filtered.length ? filtered : matches).slice(0, topK);

      console.log(
        "🏆 Using",
        topMatches.length,
        "matches. Best similarity:",
        topMatches[0]?.similarity ?? "N/A",
      );

      const context = topMatches
        .map((m, i) => {
          const fname = docNameById[m.doc_id] || "Unknown Document";
          return `Source ${i + 1} — ${fname}, Page ${
            m.page_number ?? 1
          }:\n${m.text}`;
        })
        .join("\n\n");

      console.log("📚 Context length (chars):", context.length);

      if (!context.trim()) {
        console.warn("⚠ Context empty after building from matches.");
        return res.json({
          answer:
            "I couldn't find relevant information in your uploaded documents for that question. Please ask something that clearly relates to them.",
          sources: [],
        });
      }

      const completion = await groq.chat.completions.create({
        model: process.env.LLM_MODEL || "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a retrieval-augmented assistant. You MUST answer ONLY using the information in the 'Document excerpts' below. " +
              "If the documents do not contain enough information to answer, reply exactly with: \"I couldn't find relevant information in the uploaded documents for that question.\" " +
              "Do not use any external or general knowledge.",
          },
          {
            role: "user",
            content: `User question:\n${query}\n\nDocument excerpts:\n${context}`,
          },
        ],
        temperature: 0.1,
      });

      const answer =
        completion.choices[0]?.message?.content ??
        "I couldn't find relevant information in the uploaded documents for that question.";

      const sources = topMatches.map((m) => ({
        title: docNameById[m.doc_id] || "Unknown Document",
        page: m.page_number ?? 1,
        relevance: `${Math.round(m.similarity * 100)}%`,
        snippet:
          m.text.slice(0, 160).replace(/\s+/g, " ") +
          (m.text.length > 160 ? "..." : ""),
      }));

      return res.json({ answer, sources });
    } catch (err) {
      console.error("SEARCH ERROR:", err);
      res.status(500).json({ error: "Search failed." });
    }
  });


  return httpServer;
}
