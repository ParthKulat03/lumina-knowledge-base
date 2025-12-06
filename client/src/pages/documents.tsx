import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileIcon, Trash2, UploadCloud, X } from "lucide-react";

type DocumentRow = {
  id: string;
  file_name: string;
  size_bytes: number | null;
  status: string | null;
  uploaded_at: string | null;
};

export default function DocumentsPage() {
  const { user } = useAuthStore();
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const dropRef = useRef<HTMLDivElement | null>(null);

  const fetchDocs = async () => {
    if (!user) return;
    const resp = await fetch(`/api/documents?userId=${user.id}`);
    const data = await resp.json();
    setDocs(data || []);
  };

  useEffect(() => {
    fetchDocs();
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      const hasProcessing = docs.some((d) => d.status === "processing");
      if (hasProcessing) fetchDocs();
    }, 2000);

    return () => clearInterval(interval);
  }, [docs]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", user.id);

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/documents/upload");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => resolve();
      xhr.send(formData);
    });

    setIsUploading(false);
    setSelectedFile(null);
    setModalOpen(false);

    fetchDocs();
  };

  useEffect(() => {
    const dropArea = dropRef.current;
    if (!dropArea) return;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0] || null;
      setSelectedFile(file);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    dropArea.addEventListener("drop", handleDrop);
    dropArea.addEventListener("dragover", handleDragOver);

    return () => {
      dropArea.removeEventListener("drop", handleDrop);
      dropArea.removeEventListener("dragover", handleDragOver);
    };
  }, []);

  const handleDelete = async (docId: string) => {
    await fetch("/api/documents/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId }),
    });

    fetchDocs();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full">
        <div className="border-b px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Upload files and I’ll index them for semantic search.
            </p>
          </div>

          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <UploadCloud className="w-4 h-4" />
            Upload Document
          </Button>
        </div>

        <div className="flex-1 px-8 py-6 overflow-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : docs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <FileIcon className="w-10 h-10 mb-3" />
              <p className="font-medium">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Size</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.id} className="border-b">
                      <td className="px-4 py-2">{doc.file_name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            doc.status === "ready"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {(doc.size_bytes! / 1024).toFixed(1)} KB
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[450px] space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Upload Document</h2>
                <button onClick={() => setModalOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                ref={dropRef}
                className="border-2 border-dashed rounded-md p-6 text-center text-sm text-muted-foreground cursor-pointer hover:bg-muted/30 transition"
              >
                Drag & Drop file here
              </div>

              {selectedFile && (
                <div className="p-3 border rounded-md text-sm flex justify-between items-center">
                  <span>
                    {selectedFile.name} — {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <Input type="file" onChange={handleFileSelect} />

              {isUploading && (
                <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!selectedFile || isUploading}
                  onClick={handleUpload}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
