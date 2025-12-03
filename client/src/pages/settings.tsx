import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Database, Cpu, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your RAG pipeline and model parameters.</p>
        </div>

        <div className="grid gap-6">
          {/* Model Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <CardTitle>Model Configuration</CardTitle>
              </div>
              <CardDescription>Select the LLM and Embedding models for your knowledge base.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>LLM Provider</Label>
                  <Select defaultValue="gpt4">
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4">GPT-4 Turbo (OpenAI)</SelectItem>
                      <SelectItem value="claude3">Claude 3 Opus (Anthropic)</SelectItem>
                      <SelectItem value="llama3">Llama 3 70B (Groq)</SelectItem>
                      <SelectItem value="mistral">Mixtral 8x7B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Embedding Model</Label>
                  <Select defaultValue="minilm">
                    <SelectTrigger>
                      <SelectValue placeholder="Select embeddings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minilm">all-MiniLM-L6-v2 (384d)</SelectItem>
                      <SelectItem value="ada">text-embedding-3-small (1536d)</SelectItem>
                      <SelectItem value="cohere">Cohere Embed v3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hybrid Search</Label>
                    <p className="text-sm text-muted-foreground">Combine keyword search with semantic vector search</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reranking</Label>
                    <p className="text-sm text-muted-foreground">Re-rank retrieved results for better accuracy</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retrieval Parameters */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <CardTitle>Retrieval Parameters</CardTitle>
              </div>
              <CardDescription>Fine-tune how documents are chunked and retrieved.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Chunk Size</Label>
                  <div className="relative">
                    <Input type="number" defaultValue={512} />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">tokens</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Chunk Overlap</Label>
                  <div className="relative">
                    <Input type="number" defaultValue={50} />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">tokens</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Top K Results</Label>
                  <Input type="number" defaultValue={5} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline">Reset to Defaults</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
