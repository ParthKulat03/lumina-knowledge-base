import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Send, 
  Sparkles, 
  BookOpen, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  ArrowRight,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [answer, setAnswer] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasResult(false);

    // Mock AI Logic based on Keywords
    const q = query.toLowerCase();
    let mockResponse;

    if (q.includes("meeting") || q.includes("notes") || q.includes("nov")) {
      mockResponse = {
        text: `According to the <span class="font-semibold text-indigo-600 cursor-pointer hover:underline" title="Source: Meeting_Notes_Nov.txt">Meeting_Notes_Nov.txt</span>, the team discussed the Q4 roadmap adjustments. Key decisions included pushing the mobile app launch to January and prioritizing the backend scaling initiative.`,
        sources: [
          { title: "Meeting_Notes_Nov.txt", page: 1, relevance: "99%", snippet: "...agreed to delay mobile launch to Jan 15th to focus on server stability..." },
          { title: "Project_Titan_Specs.docx", page: 3, relevance: "45%", snippet: "...timeline dependencies for mobile components..." },
        ]
      };
    } else if (q.includes("titan") || q.includes("specs")) {
      mockResponse = {
        text: `The specifications for <span class="font-semibold text-indigo-600 cursor-pointer hover:underline" title="Source: Project_Titan_Specs.docx">Project Titan</span> detail a high-performance architecture requiring 128GB RAM nodes. The initial deployment will consist of 5 clusters across 3 regions.`,
        sources: [
          { title: "Project_Titan_Specs.docx", page: 2, relevance: "96%", snippet: "...hardware requirements: Minimum 128GB RAM per node, 10Gbps networking..." },
          { title: "Q3_Financial_Report.pdf", page: 8, relevance: "30%", snippet: "...allocated budget for hardware upgrades in Q4..." },
        ]
      };
    } else {
      // Default Q3 Answer
      mockResponse = {
        text: `Based on the <span class="font-semibold text-indigo-600 cursor-pointer hover:underline" title="Source: Q3_Financial_Report.pdf">Q3 Financial Report</span>, the company saw a <span class="bg-emerald-100 text-emerald-800 px-1 rounded font-medium">15% increase</span> in revenue year-over-year. This growth was primarily driven by the Enterprise sector, which outperformed expectations by 8%.`,
        sources: [
          { title: "Q3_Financial_Report.pdf", page: 4, relevance: "98%", snippet: "...revenue increased by 15% YoY, driven primarily by strong Enterprise adoption..." },
          { title: "Project_Titan_Specs.docx", page: 12, relevance: "85%", snippet: "...infrastructure requirements for Titan will necessitate a 5% OPEX increase..." },
          { title: "Meeting_Notes_Nov.txt", page: 1, relevance: "72%", snippet: "...discussed the ROI timeline for the new investments, targeting Q1 2025..." },
        ]
      };
    }

    // Simulate API delay
    setTimeout(() => {
      setAnswer(mockResponse);
      setIsSearching(false);
      setHasResult(true);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Search Header */}
        <div className="bg-background border-b sticky top-0 z-10 px-8 py-6">
          <div className="max-w-3xl mx-auto w-full">
            <h1 className="text-2xl font-semibold mb-6 text-center">What can I help you find?</h1>
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="relative bg-background rounded-xl shadow-sm border border-input flex items-center p-1">
                <Search className="ml-4 w-5 h-5 text-muted-foreground" />
                <Input 
                  className="border-none shadow-none focus-visible:ring-0 h-12 text-lg px-4"
                  placeholder="Ask a question about your documents..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button 
                  size="icon" 
                  type="submit"
                  className={cn(
                    "h-10 w-10 rounded-lg transition-all duration-300",
                    query.trim() ? "bg-indigo-600 hover:bg-indigo-700" : "bg-muted text-muted-foreground"
                  )}
                  disabled={!query.trim() || isSearching}
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </form>
            <div className="mt-4 flex justify-center gap-2 text-sm text-muted-foreground">
              <span>Try asking:</span>
              <button 
                className="hover:text-indigo-600 transition-colors"
                onClick={() => setQuery("Summarize the Q3 financial results")}
              >
                "Summarize Q3 results"
              </button>
              <span>•</span>
              <button 
                className="hover:text-indigo-600 transition-colors"
                onClick={() => setQuery("What are the project Titan specs?")}
              >
                "Project Titan specs"
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Loading State */}
            {isSearching && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pl-12">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
              </div>
            )}

            {/* Answer Section */}
            {!isSearching && hasResult && answer && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* AI Response */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="prose prose-slate max-w-none">
                      <p 
                        className="leading-relaxed text-foreground/90 text-lg"
                        dangerouslySetInnerHTML={{ __html: answer.text }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground h-8">
                        <Copy className="w-4 h-4 mr-2" /> Copy
                      </Button>
                      <div className="w-px h-4 bg-border" />
                      <Button variant="ghost" size="sm" className="text-muted-foreground h-8">
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground h-8">
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Citations / Sources */}
                <div className="pl-12">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Sources & Citations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {answer.sources.map((source: any, i: number) => (
                      <Card key={i} className="group hover:border-indigo-300 transition-colors cursor-pointer bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded bg-indigo-50 text-indigo-600">
                                <FileText className="w-3 h-3" />
                              </div>
                              <span className="font-medium text-sm truncate max-w-[150px]">{source.title}</span>
                            </div>
                            <Badge variant="secondary" className="font-mono text-xs">{source.relevance}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            "{source.snippet}"
                          </p>
                          <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Page {source.page}</span>
                            <span className="text-indigo-600 font-medium">View Chunk →</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Empty State / Intro */}
            {!isSearching && !hasResult && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
                <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Ready to search</h3>
                <p className="text-muted-foreground max-w-xs mt-2">
                  Upload documents to your knowledge base to start asking questions.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
