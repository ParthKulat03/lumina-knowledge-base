import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  MoreHorizontal, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Trash2,
  File,
  X,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";

// Mock Data
const INITIAL_DOCS = [
  { id: "1", name: "Q3_Financial_Report.pdf", size: "2.4 MB", uploadedAt: "2 hrs ago", status: "indexed", chunks: 142 },
  { id: "2", name: "Employee_Handbook_2024.pdf", size: "4.1 MB", uploadedAt: "5 hrs ago", status: "indexed", chunks: 389 },
  { id: "3", name: "Project_Titan_Specs.docx", size: "1.2 MB", uploadedAt: "1 day ago", status: "processing", chunks: 0 },
  { id: "4", name: "Meeting_Notes_Nov.txt", size: "14 KB", uploadedAt: "2 days ago", status: "indexed", chunks: 12 },
];

export default function DocumentsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<any[]>([]);
  const [docs, setDocs] = useState(INITIAL_DOCS);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateUpload = () => {
    const newFile = { 
      id: Date.now().toString(), 
      name: "New_Strategy_Doc.pdf", 
      size: "1.8 MB", 
      progress: 0,
      status: 'uploading'
    };
    
    setUploadingFiles([newFile]);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadingFiles(prev => prev.map(f => ({ ...f, progress })));
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadingFiles([]);
          setIsUploadOpen(false);
          setDocs(prev => [{
            id: newFile.id,
            name: newFile.name,
            size: newFile.size,
            uploadedAt: "Just now",
            status: "processing",
            chunks: 0
          }, ...prev]);
        }, 500);
      }
    }, 300);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    simulateUpload();
  };

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(doc => doc.id !== id));
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
              
              {!uploadingFiles.length ? (
                <div 
                  className={`
                    mt-4 border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
                    ${dragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-muted-foreground/25 hover:bg-muted/50'}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={simulateUpload}
                >
                  <div className="flex flex-col items-center justify-center gap-4 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, TXT, DOCX up to 10MB</p>
                    </div>
                    <Button variant="outline" size="sm">Select Files</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {uploadingFiles.map((file, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded border shadow-sm">
                            <FileText className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <Progress value={file.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{file.progress === 100 ? 'Complete' : 'Uploading...'}</span>
                          <span>{file.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
              {docs.map((doc) => (
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
                    {doc.status === 'indexed' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Indexed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                        {doc.status === 'processing' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )} 
                        <span className="capitalize">{doc.status}</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{doc.size}</TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">{doc.chunks > 0 ? doc.chunks : '-'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{doc.uploadedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
