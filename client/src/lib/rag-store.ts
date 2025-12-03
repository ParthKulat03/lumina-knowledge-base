import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Chunk {
  id: string;
  docId: string;
  text: string;
  page: number;
  embedding?: number[]; // Mock embedding
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'txt';
  size: string;
  uploadedAt: string;
  status: 'indexing' | 'ready';
  content: string;
  chunks: Chunk[];
}

interface RagState {
  documents: Document[];
  addDocument: (file: File) => Promise<void>;
  removeDocument: (id: string) => void;
  search: (query: string) => Promise<{ answer: string; sources: any[] }>;
}

// Helper to simulate text chunking
const chunkText = (text: string, docId: string): Chunk[] => {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.map((p, i) => ({
    id: `${docId}-chunk-${i}`,
    docId,
    text: p.trim(),
    page: Math.floor(i / 3) + 1, // Mock page numbers: every 3 paragraphs is a page
  })).filter(c => c.text.length > 0);
};

// Helper to calculate similarity score (TF-IDF style simplified)
const calculateScore = (query: string, chunkText: string, filename: string): number => {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const text = chunkText.toLowerCase();
  const fname = filename.toLowerCase();
  
  let score = 0;
  
  // Term frequency in chunk
  queryTerms.forEach(term => {
    if (text.includes(term)) score += 10;
  });

  // Boost if filename is mentioned
  if (queryTerms.some(term => fname.includes(term) && term.length > 3)) {
    score += 50;
  }

  // Exact phrase matching
  if (text.includes(query.toLowerCase())) {
    score += 30;
  }

  return score;
};

// Helper to detect page requests
const detectPageConstraint = (query: string): number | null => {
  const match = query.match(/page\s+(\d+)/i);
  return match ? parseInt(match[1]) : null;
};

export const useRagStore = create<RagState>()(
  persist(
    (set, get) => ({
      documents: [
        {
          id: "1",
          name: "Q3_Financial_Report.txt",
          type: "txt",
          size: "2.4 MB",
          uploadedAt: "2 hrs ago",
          status: "ready",
          content: "The Q3 Financial Report indicates a 15% increase in revenue year-over-year. This growth was primarily driven by the Enterprise sector, which outperformed expectations by 8%. Operating costs rose by 5% due to new infrastructure investments. \n\n The breakdown of revenue by region shows North America leading with 45%, followed by Europe at 30% and Asia-Pacific at 25%. \n\n Future outlook suggests a stabilization of growth in Q4 as market saturation approaches in key verticals.",
          chunks: chunkText("The Q3 Financial Report indicates a 15% increase in revenue year-over-year. This growth was primarily driven by the Enterprise sector, which outperformed expectations by 8%. Operating costs rose by 5% due to new infrastructure investments. \n\n The breakdown of revenue by region shows North America leading with 45%, followed by Europe at 30% and Asia-Pacific at 25%. \n\n Future outlook suggests a stabilization of growth in Q4 as market saturation approaches in key verticals.", "1")
        },
        {
          id: "2",
          name: "Project_Titan_Specs.txt",
          type: "txt",
          size: "1.2 MB",
          uploadedAt: "1 day ago",
          status: "ready",
          content: "Project Titan Specifications.\n\n 1. Architecture: The system requires a high-performance cluster with minimum 128GB RAM per node. \n\n 2. Network: 10Gbps low-latency interconnects are mandatory for the database shading layer. \n\n 3. Storage: NVMe SSDs with at least 50k IOPS are required for the hot tier. \n\n 4. Security: All data at rest must be encrypted using AES-256. Data in transit requires TLS 1.3.",
          chunks: chunkText("Project Titan Specifications.\n\n 1. Architecture: The system requires a high-performance cluster with minimum 128GB RAM per node. \n\n 2. Network: 10Gbps low-latency interconnects are mandatory for the database shading layer. \n\n 3. Storage: NVMe SSDs with at least 50k IOPS are required for the hot tier. \n\n 4. Security: All data at rest must be encrypted using AES-256. Data in transit requires TLS 1.3.", "2")
        }
      ],

      addDocument: async (file: File) => {
        // Simulate file reading
        const text = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string || "");
          // For mockup: if PDF, we just fake it because we can't parse PDF easily in browser without heavy libs
          if (file.type === "application/pdf") {
             resolve(`[Simulated Content for ${file.name}]\n\nThis is the content of page 1. It discusses the main topic of ${file.name}.\n\nThis is page 2. It goes into more detail about the specific requirements.\n\nThis is page 3. It concludes with summary points.`);
          } else {
             reader.readAsText(file);
          }
        });

        const newDoc: Document = {
          id: Date.now().toString(),
          name: file.name,
          type: file.name.endsWith('pdf') ? 'pdf' : 'txt',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: "Just now",
          status: "indexing",
          content: text,
          chunks: [],
        };

        set((state) => ({ documents: [newDoc, ...state.documents] }));

        // Simulate indexing delay
        setTimeout(() => {
          set((state) => ({
            documents: state.documents.map(d => 
              d.id === newDoc.id 
                ? { ...d, status: 'ready', chunks: chunkText(text, d.id) }
                : d
            )
          }));
        }, 2000);
      },

      removeDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        }));
      },

      search: async (query) => {
        const state = get();
        const pageReq = detectPageConstraint(query);
        const lowercaseQuery = query.toLowerCase();

        // 1. Gather all chunks
        let allChunks = state.documents.flatMap(d => 
          d.chunks.map(c => ({ ...c, filename: d.name }))
        );

        // 2. Filter by Filename if explicitly mentioned
        const mentionedDoc = state.documents.find(d => lowercaseQuery.includes(d.name.toLowerCase()) || lowercaseQuery.includes(d.name.toLowerCase().replace(/_/g, ' ')));
        if (mentionedDoc) {
           allChunks = allChunks.filter(c => c.docId === mentionedDoc.id);
        }

        // 3. Filter by Page if explicitly mentioned
        if (pageReq !== null) {
          allChunks = allChunks.filter(c => c.page === pageReq);
        }

        // 4. Score chunks
        const scoredChunks = allChunks.map(chunk => ({
          chunk,
          score: calculateScore(query, chunk.text, chunk.filename)
        }));

        // 5. Sort and take Top K
        const topChunks = scoredChunks
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        if (topChunks.length === 0) {
          return {
            answer: "I couldn't find any relevant information in your uploaded documents matching that query.",
            sources: []
          };
        }

        // 6. Synthesize Answer (Extractive RAG)
        // In a real system, an LLM would rewrite this. Here, we combine the best chunks.
        const bestMatch = topChunks[0];
        let answerText = `Based on <strong>${bestMatch.chunk.filename}</strong> (Page ${bestMatch.chunk.page}):<br/><br/>"${bestMatch.chunk.text}"`;
        
        if (topChunks.length > 1) {
           answerText += `<br/><br/>Also found in <strong>${topChunks[1].chunk.filename}</strong>:<br/>"${topChunks[1].chunk.text}"`;
        }

        return {
          answer: answerText,
          sources: topChunks.map(tc => ({
            title: tc.chunk.filename,
            page: tc.chunk.page,
            relevance: `${Math.min(Math.round(tc.score * 2), 99)}%`,
            snippet: tc.chunk.text.substring(0, 100) + "..."
          }))
        };
      }
    }),
    {
      name: 'rag-storage',
    }
  )
);
