"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { EdgeStoreProvider, useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import React, { useCallback, useEffect, useState } from "react";

// --- Types -----------------------------------------------------------------

interface FormData {
  caseName: string;
  areaOfLaw: string;
}

interface UploadedFile {
  fileName: string;
  url: string; // empty string if upload failed
  size: number; // keep as number for formatting
  mime?: string; // optional mime type
  originalFileName?: string; // preserve original name if needed
}

interface LocalFileWithPreview {
  file: File;
  previewUrl?: string; // created with URL.createObjectURL for images
}

type Step = "form" | "upload" | "review";

const AREA_OF_LAW_OPTIONS = [
  { value: "criminal", label: "Criminal Law" },
  { value: "civil", label: "Civil Law" },
  { value: "corporate", label: "Corporate Law" },
  { value: "family", label: "Family Law" },
  { value: "intellectual", label: "Intellectual Property Law" },
] as const;

const ACCEPTED_MIME = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
].join(",");

// --- Top-level wrapper ----------------------------------------------------
export default function DashboardWrapper() {
  return (
    <EdgeStoreProvider>
      <Dashboard />
    </EdgeStoreProvider>
  );
}

// --- Dashboard -------------------------------------------------------------
export function Dashboard() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>({ caseName: "", areaOfLaw: "" });
  const [localFiles, setLocalFiles] = useState<LocalFileWithPreview[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { edgestore } = useEdgeStore();
  const createTimeline = useMutation(api.timeline.createTimeline);

  useEffect(() => {
    // Cleanup previews on unmount
    return () => {
      localFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
  }, [localFiles]);

  // --- form handlers -----------------------------------------------------
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm((p) => ({ ...p, [name]: value }));
    },
    []
  );

  const handleAreaOfLawChange = useCallback((value: string) => {
    setForm((p) => ({ ...p, areaOfLaw: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm({ caseName: "", areaOfLaw: "" });
    setUploadStatus(null);
  }, []);

  const handleNext = useCallback(() => {
    if (!form.caseName.trim()) {
      setUploadStatus("Please enter a case name.");
      return;
    }
    if (!form.areaOfLaw.trim()) {
      setUploadStatus("Please select an area of law.");
      return;
    }
    setUploadStatus(null);
    setStep("upload");
  }, [form.caseName, form.areaOfLaw]);

  const handleBack = useCallback(() => setStep("form"), []);

  // --- file selection handlers -------------------------------------------
  const handleFilesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length === 0) return;

    const newFiles = selected.map((f) => ({
      file: f,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    } as LocalFileWithPreview));

    setLocalFiles((prev) => [...prev, ...newFiles]);

    // clear so same file can be selected again
    e.currentTarget.value = "";
  }, []);

  const removeLocalFile = useCallback((index: number) => {
    setLocalFiles((prev) => {
      const newArr = prev.slice();
      const [removed] = newArr.splice(index, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return newArr;
    });
  }, []);

  const clearLocalFiles = useCallback(() => {
    localFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setLocalFiles([]);
  }, [localFiles]);

  // --- upload logic (optimised, parallel with per-file status) ----------
  const uploadFiles = useCallback(async () => {
    if (!edgestore) {
      setUploadStatus("EdgeStore client not initialized.");
      return;
    }

    if (localFiles.length === 0) {
      setUploadStatus("No files selected to upload.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading files...");

    try {
      // upload all files in parallel but limit concurrency if needed
      const promises = localFiles.map(async ({ file }) => {
        try {
          // edgestore.publicFiles.upload({ file }) assumed to return { url }
          const resp = await edgestore.publicFiles.upload({ file });
          return {
            fileName: file.name,
            url: resp?.url ?? "",
            size: file.size,
            mime: file.type,
            originalFileName: file.name,
          } as UploadedFile;
        } catch (err) {
          console.error("Upload failed for", file.name, err);
          return {
            fileName: file.name,
            url: "",
            size: file.size,
            mime: file.type,
            originalFileName: file.name,
          } as UploadedFile;
        }
      });

      const results = await Promise.all(promises);
      setUploadedFiles(results);

      const successCount = results.filter((r) => r.url).length;
      setUploadStatus(`Uploaded ${successCount} / ${results.length} file(s)`);

      // move to review step even if some uploads failed so user can inspect
      setStep("review");
    } catch (error) {
      console.error("Upload process failed:", error);
      setUploadStatus("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [edgestore, localFiles]);

  // --- final submission -------------------------------------------------
  const handleFinalSubmit = useCallback(
    async (filesToSubmit?: UploadedFile[]) => {
      const toSubmit = filesToSubmit ?? uploadedFiles;

      if (!form.caseName.trim() || !form.areaOfLaw.trim()) {
        setUploadStatus("Please ensure case name and area of law are provided.");
        return;
      }

      setIsSubmitting(true);
      setUploadStatus("Submitting timeline...");

      try {
        // <-- FIX: send objects with fileName, size (string), url (string) per Convex validator
        const payloadFiles = toSubmit.map((f) => ({
          fileName: f.fileName,
          size: String(f.size), // convert to string as validator expects
          url: f.url,
        }));

        await createTimeline({
          caseName: form.caseName,
          areaOfLaw: form.areaOfLaw,
          files: payloadFiles,
        });

        setUploadStatus("Timeline created successfully!");

        // Reset everything cleanly
        localFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
        setForm({ caseName: "", areaOfLaw: "" });
        setLocalFiles([]);
        setUploadedFiles([]);

        // bring user back to form; keep success message for a moment
        setTimeout(() => {
          setUploadStatus(null);
          setStep("form");
        }, 1500);
      } catch (error) {
        console.error("Timeline creation failed:", error);
        setUploadStatus("Failed to create timeline. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [createTimeline, form.caseName, form.areaOfLaw, uploadedFiles, localFiles]
  );

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-5 font-sans flex flex-col items-center">
      <div className=" flex flex-col gap-4 max-w-2xl bg-white rounded-2xl shadow-md p-6 w-full md:w-[50%]">
        <header>
          <h1 className="text-2xl font-medium">Create new timeline</h1>
          <p className="text-sm font-light text-slate-500">
            Enter timeline details and upload relevant files
          </p>
        </header>

        {step === "form" && (
          <FormStep
            form={form}
            uploadStatus={uploadStatus}
            onInputChange={handleInputChange}
            onAreaOfLawChange={handleAreaOfLawChange}
            onNext={handleNext}
            onReset={resetForm}
          />
        )}

        {step === "upload" && (
          <UploadStep
            form={form}
            localFiles={localFiles}
            uploadStatus={uploadStatus}
            isUploading={isUploading}
            isSubmitting={isSubmitting}
            formatFileSize={formatFileSize}
            onBack={handleBack}
            onFilesChange={handleFilesChange}
            onRemoveLocalFile={removeLocalFile}
            onClearLocalFiles={clearLocalFiles}
            onUploadFiles={uploadFiles}
          />
        )}

        {step === "review" &&
          renderFileReview({
            form,
            uploadedFiles,
            localFiles,
            formatFileSize,
            uploadStatus,
            isSubmitting,
            onEditBack: () => setStep("upload"),
            onSubmit: () => handleFinalSubmit(),
            onRemoveUploaded: (index: number) => {
              setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
            },
            onRetryUpload: async (index: number) => {
              const candidate = localFiles[index];
              if (!edgestore || !candidate) {
                setUploadStatus("Cannot retry: missing client or file.");
                return;
              }

              setIsUploading(true);
              setUploadStatus(`Retrying upload for ${candidate.file.name}...`);
              try {
                const resp = await edgestore.publicFiles.upload({
                  file: candidate.file,
                });
                setUploadedFiles((prev) => {
                  const copy = prev.slice();
                  copy[index] = {
                    fileName: candidate.file.name,
                    url: resp?.url ?? "",
                    size: candidate.file.size,
                    mime: candidate.file.type,
                    originalFileName: candidate.file.name,
                  };
                  return copy;
                });
                setUploadStatus("Retry complete");
              } catch (err) {
                console.error("Retry failed", err);
                setUploadStatus("Retry failed");
              } finally {
                setIsUploading(false);
              }
            },
          })}
      </div>
    </div>
  );
}

// --- FormStep --------------------------------------------------------------
function FormStep({
  form,
  uploadStatus,
  onInputChange,
  onAreaOfLawChange,
  onNext,
  onReset,
}: {
  form: FormData;
  uploadStatus: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAreaOfLawChange: (value: string) => void;
  onNext: () => void;
  onReset: () => void;
}) {
  return (
    <section>
      <div className="flex flex-col gap-6 mt-8">
        <label className="flex flex-col">
          <span className="text-sm font-light text-slate-700 mb-1">
            Case Name *
          </span>
          <input
            name="caseName"
            value={form.caseName}
            onChange={onInputChange}
            className="rounded-md border border-slate-200 px-3 py-2 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
            placeholder="e.g. ACME vs Smith"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-light text-gray-800 mb-1">
            Area of Law *
          </span>
          <Select value={form.areaOfLaw} onValueChange={onAreaOfLawChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select area of law" />
            </SelectTrigger>
            <SelectContent>
              {AREA_OF_LAW_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      {uploadStatus && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            uploadStatus.includes("Please")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {uploadStatus}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onNext}
          disabled={!form.caseName.trim() || !form.areaOfLaw.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>

        <button
          onClick={onReset}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </section>
  );
}

// --- UploadStep -----------------------------------------------------------
function UploadStep({
  form,
  localFiles,
  uploadStatus,
  isUploading,
  isSubmitting,
  formatFileSize,
  onBack,
  onFilesChange,
  onRemoveLocalFile,
  onClearLocalFiles,
  onUploadFiles,
}: {
  form: FormData;
  localFiles: LocalFileWithPreview[];
  uploadStatus: string | null;
  isUploading: boolean;
  isSubmitting: boolean;
  formatFileSize: (b: number) => string;
  onBack: () => void;
  onFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLocalFile: (index: number) => void;
  onClearLocalFiles: () => void;
  onUploadFiles: () => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h2 className="text-lg font-medium">
            Upload files for: {form.caseName}
          </h2>
          <p className="text-sm text-slate-500">Area: {form.areaOfLaw}</p>
        </div>
        <button
          onClick={onBack}
          disabled={isUploading || isSubmitting}
          className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Back
        </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-3">
        <div className="rounded-lg border border-slate-200 p-4 w-5/6">
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-slate-50 text-center hover:bg-slate-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm font-light text-slate-600">
              Click to select files{" "}
            </span>
            <input
              type="file"
              multiple
              onChange={onFilesChange}
              disabled={isUploading || isSubmitting}
              className="sr-only"
              accept={ACCEPTED_MIME}
            />
          </label>

          <div className="mt-4 space-y-4 max-h-70 w-[70%] ">
            {localFiles.length === 0 ? (
              <p className="text-sm text-slate-500">No files selected</p>
            ) : (
              localFiles.map(({ file, previewUrl }, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-3 py-2 text-slate-600 hover:bg-slate-100"
                >
                  <div className="truncate text-sm flex-1 mr-2">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="h-8 w-8 object-cover rounded"
                      />
                    )}
                    <button
                      onClick={() => onRemoveLocalFile(index)}
                      disabled={isUploading || isSubmitting}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={onUploadFiles}
              disabled={localFiles.length === 0 || isUploading || isSubmitting}
              className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-small text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isUploading ? "Uploading..." : "Upload Files"}
            </button>

            <button
              onClick={onClearLocalFiles}
              disabled={localFiles.length === 0 || isUploading || isSubmitting}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 font-light"
            >
              Clear All
            </button>
          </div>

          {uploadStatus && (
            <div
              className={`mt-3 p-3 rounded-md text-sm ${
                uploadStatus.toLowerCase().includes("failed")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : uploadStatus.toLowerCase().includes("uploaded")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// --- FileReview rendered by a plain function (not a React component)
function renderFileReview({
  uploadedFiles,
  localFiles,
  formatFileSize,
  uploadStatus,
  isSubmitting,
  onEditBack,
  onSubmit,
  onRemoveUploaded,
  onRetryUpload,
}: {
  form: FormData;
  uploadedFiles: UploadedFile[];
  localFiles: LocalFileWithPreview[];
  formatFileSize: (b: number) => string;
  uploadStatus: string | null;
  isSubmitting: boolean;
  onEditBack: () => void;
  onSubmit: () => void;
  onRemoveUploaded: (index: number) => void;
  onRetryUpload: (index: number) => void;
}) {
  const anyFailed = uploadedFiles.some((f) => !f.url);
  const allSucceeded = uploadedFiles.length > 0 && uploadedFiles.every((f) => !!f.url);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg ">Review uploaded files</h2>
          <p className="text-sm font-light text-slate-500">Confirm before creating the timeline</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onEditBack} className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-light text-slate-700 hover:bg-slate-50">Edit</button>
          <button onClick={onSubmit} disabled={isSubmitting || uploadedFiles.length === 0} className="rounded-lg font-light bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50">Create Timeline</button>
        </div>
      </div>

      <div className="space-y-4">
        {uploadedFiles.map((f, idx) => (
          <div key={`${f.fileName}-${idx}`} className="flex items-center justify-between rounded-md border p-3 bg-white">
            <div className="flex items-center gap-3">
              {/* preview if local image available */}
              {localFiles[idx]?.previewUrl ? (
                <img src={localFiles[idx].previewUrl} alt={f.fileName} className="h-12 w-12 object-cover rounded" />
              ) : (
                <div className="h-12 w-12 flex items-center justify-center rounded bg-slate-100 text-xs text-slate-500">{f.fileName.split('.').pop()}</div>
              )}

              <div>
                <div className="font-medium">{f.fileName}</div>
                <div className="text-xs text-slate-500">{formatFileSize(f.size)} • {f.mime ?? 'unknown'}</div>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline">Open</a>
                ) : (
                  <div className="text-xs text-red-600">Upload failed</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!f.url && (
                <button onClick={() => onRetryUpload(idx)} className="text-sm text-gray-600 hover:underline">Retry</button>
              )}
              <button onClick={() => onRemoveUploaded(idx)} className="text-sm text-red-600 hover:text-red-800">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-slate-600">
        {uploadStatus && <div className="mb-2">{uploadStatus}</div>}
        {anyFailed && <div className="text-red-600">Some files failed to upload. Use Retry or Remove.</div>}
        {allSucceeded && <div className="text-green-700">All files uploaded successfully — ready to submit.</div>}
      </div>
    </section>
  );
}
