import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRagStore } from "@/lib/rag-store";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Trash2,
  X,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function DocumentsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { documents, addDocument, removeDocument } = useRagStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processUpload(files[0]);
    }
  };

  const processUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    // Fake progress for visual feedback
    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    await addDocument(file);

    clearInterval(interval);
    setUploadProgress(100);
    
    setTimeout(() => {
      setUploading(false);
      setIsUploadOpen(false);
      setUploadProgress(0);
    }, 500);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUpload(e.target.files[0]);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground mt-1">Manage your knowledge base sources.</p>
          </div>
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-md">
                <UploadCloud className="w-4 h-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Upload Documents</DialogTitle>
                <DialogDescription>
                  Drag and drop PDF or TXT files here to add them to the knowledge base.
                </DialogDescription>
              </DialogHeader>
              
              {!uploading ? (
                <div 
                  className={`
                    mt-4 border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
                    ${dragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-muted-foreground/25 hover:bg-muted/50'}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, TXT, DOCX up to 10MB</p>
                    </div>
                    <div className="relative">
                      <Button variant="outline" size="sm" className="pointer-events-none">Select Files</Button>
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileInput}
                        accept=".txt,.pdf,.md,.docx"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded border shadow-sm">
                          <FileText className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Uploading...</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={uploadProgress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{uploadProgress === 100 ? 'Complete' : 'Processing...'}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/60">
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Chunks</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No documents uploaded yet.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-muted text-muted-foreground">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span>{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.status === 'ready' ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Indexed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Indexing
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{doc.size}</TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {doc.chunks?.length || 0}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{doc.uploadedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
