"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  X,
  Loader2,
  Sparkles,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface FileItem {
  file: File;
  id: string;
  status: "pending" | "uploading" | "processing" | "done" | "error";
  error?: string;
}

export function DropZone({
  onUploadSuccess,
}: {
  onUploadSuccess: (receiptId: string) => void;
}) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setGlobalError(null);
    const newFiles: FileItem[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDropRejected: (fileRejections) => {
      setGlobalError(fileRejections[0].errors[0].message);
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (fileItem: FileItem): Promise<string> => {
    const formData = new FormData();
    formData.append("file", fileItem.file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      const errorMessage = data.details
        ? `${data.error}: ${data.details}`
        : data.error || "Upload failed";
      throw new Error(errorMessage);
    }

    const { receiptId } = await response.json();
    return receiptId;
  };

  const processFile = async (receiptId: string): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!processResponse.ok) {
        const processData = await processResponse.json();
        throw new Error(processData.error || "AI processing failed");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("AI processing timed out. Please try again.");
      }
      throw err;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setGlobalError(null);

    const pendingFiles = files.filter((f) => f.status === "pending");
    const successfulIds: string[] = [];

    // Process all files in parallel
    const results = await Promise.allSettled(
      pendingFiles.map(async (fileItem) => {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "uploading" as const } : f,
          ),
        );

        try {
          const receiptId = await uploadFile(fileItem);

          // Update status to processing
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, status: "processing" as const }
                : f,
            ),
          );

          await processFile(receiptId);

          // Update status to done
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id ? { ...f, status: "done" as const } : f,
            ),
          );

          successfulIds.push(fileItem.id);
          return receiptId;
        } catch (err: any) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, status: "error" as const, error: err.message }
                : f,
            ),
          );
          throw err;
        }
      }),
    );

    setIsUploading(false);

    // Check for successful uploads and call callback
    const successfulUploads = results.filter((r) => r.status === "fulfilled");
    if (successfulUploads.length > 0) {
      onUploadSuccess(successfulUploads[0].value);
    }

    // Check if all failed
    const allFailed = results.every((r) => r.status === "rejected");
    if (allFailed && results.length > 0) {
      setGlobalError("All uploads failed. Please try again.");
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const processingCount = files.filter(
    (f) => f.status === "uploading" || f.status === "processing",
  ).length;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {files.length === 0 ? (
        <div
          {...getRootProps()}
          className={`relative overflow-hidden border-2 border-dashed rounded-[32px] p-12 text-center cursor-pointer transition-all duration-300 group ${
            isDragActive
              ? "border-blue-600 bg-blue-50/50 scale-[0.98]"
              : "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/50"
          }`}
        >
          <input {...getInputProps()} />

          <div className="relative z-10">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100">
              <UploadCloud
                className={`h-10 w-10 ${isDragActive ? "text-blue-600" : "text-slate-400"}`}
              />
            </div>
            <p className="text-xl font-bold text-slate-900">
              {isDragActive
                ? "Drop them right here!"
                : "Drop your receipts here"}
            </p>
            <p className="text-slate-500 font-medium mt-2">
              Or click to browse your files (up to 10)
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                JPG
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                PNG
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                PDF
              </span>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <AnimatePresence>
            {globalError && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-rose-600 mt-6 font-bold bg-rose-50 py-2 px-4 rounded-full inline-block border border-rose-100"
              >
                {globalError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[32px] p-8 shadow-xl shadow-slate-200/50"
        >
          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="truncate min-w-0">
                    <p className="font-bold text-slate-900 truncate text-sm">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs font-bold text-slate-400">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {fileItem.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(fileItem.id)}
                      className="rounded-full h-8 w-8 hover:bg-slate-200 text-slate-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {fileItem.status === "pending" && (
                    <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                  {fileItem.status === "uploading" && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading
                    </span>
                  )}
                  {fileItem.status === "processing" && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Processing
                    </span>
                  )}
                  {fileItem.status === "done" && (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Done
                    </span>
                  )}
                  {fileItem.status === "error" && (
                    <span
                      className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-full flex items-center gap-1"
                      title={fileItem.error}
                    >
                      <AlertCircle className="h-3 w-3" /> Failed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-500">
              {processingCount > 0
                ? `Processing ${processingCount} ${processingCount === 1 ? "image" : "images"}...`
                : `${doneCount} of ${files.length} processed`}
            </p>
            {files.some((f) => f.status === "done") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFiles((prev) => prev.filter((f) => f.status !== "done"))
                }
                className="text-slate-500 hover:text-slate-700"
              >
                Clear done
              </Button>
            )}
          </div>

          <Button
            className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 font-black text-lg shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
            onClick={handleUpload}
            disabled={isUploading || pendingCount === 0}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Processing {pendingCount} receipt{pendingCount !== 1 ? "s" : ""}
                ...
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6" />
                Process with AI
              </>
            )}
          </Button>

          {files.length > 0 && files.some((f) => f.status === "pending") && (
            <div {...getRootProps()} className="text-center">
              <Button
                variant="outline"
                className="w-full rounded-full border-dashed border-2"
              >
                Add more receipts
              </Button>
              <input {...getInputProps()} />
            </div>
          )}

          {globalError && (
            <p className="text-sm text-rose-600 text-center mt-4 font-bold">
              {globalError}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
