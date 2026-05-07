"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  FolderOpen,
  Check,
  Copy,
  Loader2,
  BookOpen,
  UserPlus,
  Users,
  Pencil,
  Award,
  Mail,
  Eye,
} from "lucide-react";

interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

interface Avreich {
  id: string;
  name: string;
  imageUrl: string;
}

interface Haskama {
  id: string;
  name: string;
  title: string;
  quote: string;
  imageUrl: string;
}

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
}

const FOLDERS = [
  { id: "avreichim-manager", label: "Avreichim", description: "Manage scholars", icon: Users },
  { id: "haskamos-manager", label: "Haskamos", description: "Manage endorsements", icon: Award },
  { id: "messages", label: "Messages", description: "Contact submissions", icon: Mail },
  { id: "logo", label: "Logo", description: "Site logo image", icon: FolderOpen },
  { id: "gallery", label: "Gallery", description: "General gallery images", icon: FolderOpen },
];

export default function AdminPage() {
  const [activeFolder, setActiveFolder] = useState("avreichim-manager");
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Avreichim state
  const [avreichim, setAvreichim] = useState<Avreich[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [addingAvreich, setAddingAvreich] = useState(false);

  // Bulk upload state
  const [bulkFiles, setBulkFiles] = useState<{ file: File; name: string }[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // Haskamos state
  const [haskamos, setHaskamos] = useState<Haskama[]>([]);
  const [hNew, setHNew] = useState({ name: "", title: "", quote: "" });
  const [hPhoto, setHPhoto] = useState<File | null>(null);
  const [addingHaskama, setAddingHaskama] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<ContactMsg[]>([]);

  // Inline editing (avreichim)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Inline editing (haskamos)
  const [editingHaskamaId, setEditingHaskamaId] = useState<string | null>(null);
  const [editingHaskama, setEditingHaskama] = useState({ name: "", title: "", quote: "" });
  const [editingHaskamaPhoto, setEditingHaskamaPhoto] = useState<File | null>(null);

  const isAvreichimManager = activeFolder === "avreichim-manager";
  const isHaskamosManager = activeFolder === "haskamos-manager";
  const isMessages = activeFolder === "messages";

  const loadFiles = useCallback(
    async (folder?: string) => {
      const f = folder || activeFolder;
      if (f === "avreichim-manager" || f === "haskamos-manager" || f === "messages") return;
      setLoading(true);
      try {
        const res = await fetch(`/api/images?folder=${f}`);
        const data = await res.json();
        setFiles(data.blobs || []);
      } catch {
        setFiles([]);
      }
      setLoading(false);
    },
    [activeFolder]
  );

  const loadAvreichim = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/avreichim?_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      setAvreichim(Array.isArray(data) ? data : []);
    } catch {
      setAvreichim([]);
    }
    setLoading(false);
  }, []);

  const loadHaskamos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/haskamos?_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      setHaskamos(Array.isArray(data) ? data : []);
    } catch {
      setHaskamos([]);
    }
    setLoading(false);
  }, []);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contact?_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAvreichimManager) loadAvreichim();
    if (isHaskamosManager) loadHaskamos();
    if (isMessages) loadMessages();
  }, [isAvreichimManager, isHaskamosManager, isMessages, loadAvreichim, loadHaskamos, loadMessages]);

  const addAvreich = async () => {
    if (!newName.trim() && !newPhoto) return;
    setAddingAvreich(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("name", newName.trim());
    if (newPhoto) formData.append("file", newPhoto);

    try {
      const res = await fetch("/api/avreichim", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Failed to add");
      } else {
        setNewName("");
        setNewPhoto(null);
        if (data.all) setAvreichim(data.all);
        else await loadAvreichim();
      }
    } catch (err) {
      setUploadError(String(err));
    }
    setAddingAvreich(false);
  };

  const addBulkFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        file: f,
        name: f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      }));
    setBulkFiles((prev) => [...prev, ...newFiles]);
  };

  const uploadAllBulk = async () => {
    if (bulkFiles.length === 0) return;
    setBulkUploading(true);
    setBulkProgress(0);
    setUploadError(null);

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Step 1: Upload photos one at a time with delay to avoid overwhelming server
    const entries: { name: string; imageUrl: string }[] = [];
    const errors: string[] = [];

    for (let i = 0; i < bulkFiles.length; i++) {
      const { file, name } = bulkFiles[i];
      let imageUrl = "";

      // Retry up to 2 times per file
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "avreichim/photos");
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            imageUrl = data.url;
            break;
          } else {
            const errData = await res.json().catch(() => ({ error: res.statusText }));
            if (attempt === 1) errors.push(`"${name}": ${errData.error}`);
          }
        } catch (err) {
          if (attempt === 1) errors.push(`"${name}": ${err}`);
        }
        // Wait before retry
        if (attempt === 0) await delay(500);
      }

      entries.push({ name, imageUrl });
      setBulkProgress(i + 1);

      // Small delay between uploads to prevent server overload
      if (i < bulkFiles.length - 1) await delay(200);
    }

    // Step 2: Save all entries in one atomic request
    try {
      const res = await fetch("/api/avreichim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const resData = await res.json();
      if (!res.ok) {
        errors.push(`Save: ${resData.error || "Failed"}`);
      } else if (resData.all) {
        setAvreichim(resData.all);
      }
    } catch (err) {
      errors.push(`Save: ${err}`);
    }

    if (errors.length > 0) {
      setUploadError(`${errors.length} error(s): ${errors.join("; ")}`);
    }

    setBulkFiles([]);
    setBulkUploading(false);
    if (!avreichim.length) await loadAvreichim();
  };

  const renameAvreich = async (id: string, name: string) => {
    const res = await fetch("/api/avreichim", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    const data = await res.json();
    setEditingId(null);
    if (data.all) setAvreichim(data.all);
    else await loadAvreichim();
  };

  const addHaskama = async () => {
    if (!hNew.name.trim()) return;
    setAddingHaskama(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("name", hNew.name.trim());
    formData.append("title", hNew.title.trim());
    formData.append("quote", hNew.quote.trim());
    if (hPhoto) formData.append("file", hPhoto);

    try {
      const res = await fetch("/api/haskamos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Failed to add");
      } else {
        setHNew({ name: "", title: "", quote: "" });
        setHPhoto(null);
        if (data.all) setHaskamos(data.all);
        else await loadHaskamos();
      }
    } catch (err) {
      setUploadError(String(err));
    }
    setAddingHaskama(false);
  };

  const updateHaskama = async (id: string) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("name", editingHaskama.name);
    formData.append("title", editingHaskama.title);
    formData.append("quote", editingHaskama.quote);
    if (editingHaskamaPhoto) formData.append("file", editingHaskamaPhoto);

    const res = await fetch("/api/haskamos", { method: "PATCH", body: formData });
    const data = await res.json();
    setEditingHaskamaId(null);
    setEditingHaskamaPhoto(null);
    if (data.all) setHaskamos(data.all);
    else await loadHaskamos();
  };

  const markRead = async (id: string) => {
    const res = await fetch("/api/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.all) setMessages(data.all);
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const res = await fetch("/api/contact", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.all) setMessages(data.all);
    else await loadMessages();
  };

  const deleteHaskama = async (id: string) => {
    if (!confirm("Remove this haskama?")) return;
    const res = await fetch("/api/haskamos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.all) setHaskamos(data.all);
    else await loadHaskamos();
  };

  const deleteAvreich = async (id: string) => {
    if (!confirm("Remove this avreich?")) return;
    const res = await fetch("/api/avreichim", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.all) setAvreichim(data.all);
    else await loadAvreichim();
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", activeFolder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
      } else {
        await loadFiles();
      }
    } catch (err) {
      setUploadError(String(err));
    }
    setUploading(false);
  };

  const deleteFile = async (url: string) => {
    if (!confirm("Delete this image?")) return;
    await fetch("/api/images", {
      method: "DELETE",
      body: JSON.stringify({ url }),
    });
    await loadFiles();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
              <BookOpen className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                Sponsor<span className="text-amber-500">Shas</span> Admin
              </h1>
              <p className="text-xs text-slate-500">Content Management</p>
            </div>
          </div>
          <a
            href="/"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            View Site
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <div className="space-y-2">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              Sections
            </p>
            {FOLDERS.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setActiveFolder(folder.id);
                  setFiles([]);
                  setUploadError(null);
                  if (folder.id !== "avreichim-manager" && folder.id !== "haskamos-manager" && folder.id !== "messages") {
                    loadFiles(folder.id);
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all ${
                  activeFolder === folder.id
                    ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <folder.icon className="h-4 w-4" />
                <div>
                  <div className="font-medium">{folder.label}</div>
                  <div className="text-xs text-slate-500">
                    {folder.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div>
            {isAvreichimManager ? (
              /* ─── AVREICHIM MANAGER ─── */
              <div>
                {/* ── Bulk upload zone ── */}
                <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                    <Upload className="h-5 w-5 text-amber-500" />
                    Add Avreichim
                  </h3>

                  {/* Drop zone for multiple files */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      addBulkFiles(e.dataTransfer.files);
                    }}
                    className={`mb-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
                      dragOver
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2]"
                    }`}
                  >
                    <Upload className="mb-2 h-8 w-8 text-slate-500" />
                    <p className="mb-1 text-sm text-slate-300">
                      Drop multiple photos here, or click to browse
                    </p>
                    <p className="mb-3 text-xs text-slate-500">
                      Each photo becomes an avreich. You can edit names below.
                    </p>
                    <label className="cursor-pointer rounded-lg border border-white/[0.1] bg-white/[0.04] px-5 py-2 text-sm text-slate-300 transition-colors hover:border-white/[0.2] hover:text-white">
                      Choose Photos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) addBulkFiles(e.target.files);
                        }}
                      />
                    </label>
                  </div>

                  {/* Staged files - editable names */}
                  {bulkFiles.length > 0 && (
                    <div className="mb-5">
                      <p className="mb-3 text-xs font-medium text-slate-400">
                        {bulkFiles.length} photo{bulkFiles.length !== 1 ? "s" : ""} ready — edit names then upload all
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {bulkFiles.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2"
                          >
                            <img
                              src={URL.createObjectURL(item.file)}
                              alt=""
                              className="h-14 w-14 shrink-0 rounded-lg object-cover"
                            />
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                setBulkFiles((prev) =>
                                  prev.map((f, j) =>
                                    j === i ? { ...f, name: e.target.value } : f
                                  )
                                );
                              }}
                              placeholder="Name (optional)"
                              className="min-w-0 flex-1 rounded border border-white/[0.06] bg-transparent px-2 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/40"
                            />
                            <button
                              onClick={() =>
                                setBulkFiles((prev) => prev.filter((_, j) => j !== i))
                              }
                              className="shrink-0 rounded p-1 text-slate-500 transition-colors hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={uploadAllBulk}
                          disabled={bulkUploading}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-70"
                        >
                          {bulkUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading {bulkProgress}/{bulkFiles.length}...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Upload All ({bulkFiles.length})
                            </>
                          )}
                        </button>
                        {!bulkUploading && (
                          <button
                            onClick={() => setBulkFiles([])}
                            className="text-sm text-slate-500 hover:text-slate-300"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Single add (name only, no photo) */}
                  <div className="flex items-end gap-3 border-t border-white/[0.06] pt-5">
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        Or add by name only
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addAvreich(); }}
                        placeholder="e.g. Asaf Aharon Prisman"
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/40"
                      />
                    </div>
                    <button
                      onClick={addAvreich}
                      disabled={addingAvreich || !newName.trim()}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-white/[0.2] hover:text-white disabled:opacity-50"
                    >
                      {addingAvreich ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      Add
                    </button>
                  </div>

                  {uploadError && (
                    <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
                      {uploadError}
                    </p>
                  )}
                </div>

                {/* Loading */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                  </div>
                )}

                {/* Avreichim list */}
                {!loading && avreichim.length === 0 && (
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-12 text-center">
                    <Users className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                    <p className="text-sm text-slate-500">
                      No avreichim added yet. Use the form above to add scholars.
                    </p>
                  </div>
                )}

                {avreichim.length > 0 && (
                  <div>
                    <p className="mb-4 text-sm text-slate-500">
                      {avreichim.length} avreich{avreichim.length !== 1 ? "im" : ""} — this is exactly what appears on the site
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {avreichim.map((a) => (
                        <div
                          key={a.id}
                          className="group overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12]"
                        >
                          {/* Photo */}
                          <div className="relative aspect-square overflow-hidden bg-slate-900">
                            {a.imageUrl ? (
                              <img
                                src={a.imageUrl}
                                alt={a.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                <span className="text-4xl font-bold text-amber-500/15">
                                  {a.name
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .slice(0, 2)}
                                </span>
                              </div>
                            )}
                            {/* Delete overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => deleteAvreich(a.id)}
                                className="rounded-lg bg-red-500/20 p-3 backdrop-blur-sm transition-colors hover:bg-red-500/40"
                                title="Remove"
                              >
                                <Trash2 className="h-5 w-5 text-red-400" />
                              </button>
                            </div>
                          </div>
                          <div className="px-4 py-3">
                            {editingId === a.id ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={() => renameAvreich(a.id, editingName)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") renameAvreich(a.id, editingName);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="w-full rounded border border-amber-500/30 bg-white/[0.04] px-2 py-1 text-sm text-white outline-none"
                              />
                            ) : (
                              <p
                                onClick={() => { setEditingId(a.id); setEditingName(a.name); }}
                                className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-white hover:text-amber-400"
                                title="Click to edit name"
                              >
                                {a.name || <span className="text-slate-500 italic">No name</span>}
                                <Pencil className="h-3 w-3 text-slate-600" />
                              </p>
                            )}
                            <p className="text-xs text-slate-500">Avreich</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : isHaskamosManager ? (
              /* ─── HASKAMOS MANAGER ─── */
              <div>
                {/* Add form */}
                <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                    <Award className="h-5 w-5 text-amber-500" />
                    Add Haskama
                  </h3>

                  <div className="flex flex-col gap-5 sm:flex-row">
                    {/* Photo drop */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files[0];
                        if (file?.type.startsWith("image/")) setHPhoto(file);
                      }}
                      className={`relative flex h-44 w-36 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all ${
                        dragOver
                          ? "border-amber-500/50 bg-amber-500/5"
                          : hPhoto
                            ? "border-amber-500/30 bg-white/[0.02]"
                            : "border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2]"
                      }`}
                    >
                      {hPhoto ? (
                        <>
                          <img src={URL.createObjectURL(hPhoto)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                          <button onClick={() => setHPhoto(null)} className="relative z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-red-500/60">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2">
                          <Upload className="h-6 w-6 text-slate-500" />
                          <span className="text-center text-[11px] leading-tight text-slate-500">Rabbi photo<br />or click</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => setHPhoto(e.target.files?.[0] || null)} />
                        </label>
                      )}
                    </div>

                    {/* Fields */}
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">Rabbi Name *</label>
                          <input
                            type="text"
                            value={hNew.name}
                            onChange={(e) => setHNew((h) => ({ ...h, name: e.target.value }))}
                            placeholder="e.g. Rav Gershon Meltzer"
                            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/40"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-400">Title</label>
                          <input
                            type="text"
                            value={hNew.title}
                            onChange={(e) => setHNew((h) => ({ ...h, title: e.target.value }))}
                            placeholder="e.g. Rosh Kollel"
                            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/40"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-400">Quote / Endorsement</label>
                        <textarea
                          rows={2}
                          value={hNew.quote}
                          onChange={(e) => setHNew((h) => ({ ...h, quote: e.target.value }))}
                          placeholder="What did the Rabbi say about Sponsor Shas..."
                          className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/40"
                        />
                      </div>
                      <button
                        onClick={addHaskama}
                        disabled={addingHaskama || !hNew.name.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {addingHaskama ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                        Add Haskama
                      </button>
                    </div>
                  </div>

                  {uploadError && (
                    <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">{uploadError}</p>
                  )}
                </div>

                {/* Loading */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                  </div>
                )}

                {/* Haskamos list */}
                {!loading && haskamos.length === 0 && (
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-12 text-center">
                    <Award className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                    <p className="text-sm text-slate-500">No haskamos added yet.</p>
                  </div>
                )}

                {haskamos.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                      {haskamos.length} haskama{haskamos.length !== 1 ? "s" : ""} — click the pencil to edit
                    </p>
                    {haskamos.map((h) => (
                      <div key={h.id} className="group overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12]">
                        {editingHaskamaId === h.id ? (
                          /* ── Editing mode ── */
                          <div className="flex flex-col sm:flex-row gap-4 p-4">
                            {/* Photo area */}
                            <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file?.type.startsWith("image/")) setEditingHaskamaPhoto(file);
                              }}
                              className="relative flex h-36 w-28 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-amber-500/30 bg-white/[0.02]"
                            >
                              {editingHaskamaPhoto ? (
                                <>
                                  <img src={URL.createObjectURL(editingHaskamaPhoto)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                                  <button onClick={() => setEditingHaskamaPhoto(null)} className="relative z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-red-500/60">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              ) : h.imageUrl ? (
                                <>
                                  <img src={h.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                                  <label className="relative z-10 cursor-pointer rounded-lg bg-black/50 px-2 py-1 text-[10px] text-white backdrop-blur-sm hover:bg-black/70">
                                    Change
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setEditingHaskamaPhoto(e.target.files?.[0] || null)} />
                                  </label>
                                </>
                              ) : (
                                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1.5">
                                  <Upload className="h-5 w-5 text-slate-500" />
                                  <span className="text-center text-[10px] leading-tight text-slate-500">Add photo<br />or drop</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setEditingHaskamaPhoto(e.target.files?.[0] || null)} />
                                </label>
                              )}
                            </div>

                            {/* Fields */}
                            <div className="flex-1 space-y-3">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-slate-400">Rabbi Name</label>
                                  <input
                                    autoFocus
                                    type="text"
                                    value={editingHaskama.name}
                                    onChange={(e) => setEditingHaskama((h) => ({ ...h, name: e.target.value }))}
                                    className="w-full rounded-lg border border-amber-500/30 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-slate-400">Title</label>
                                  <input
                                    type="text"
                                    value={editingHaskama.title}
                                    onChange={(e) => setEditingHaskama((h) => ({ ...h, title: e.target.value }))}
                                    className="w-full rounded-lg border border-amber-500/30 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-slate-400">Quote</label>
                                <textarea
                                  rows={3}
                                  value={editingHaskama.quote}
                                  onChange={(e) => setEditingHaskama((h) => ({ ...h, quote: e.target.value }))}
                                  className="w-full resize-none rounded-lg border border-amber-500/30 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateHaskama(h.id)}
                                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2 text-xs font-semibold text-black hover:opacity-90"
                                >
                                  <Check className="h-3.5 w-3.5" /> Save
                                </button>
                                <button
                                  onClick={() => { setEditingHaskamaId(null); setEditingHaskamaPhoto(null); }}
                                  className="rounded-lg border border-white/[0.1] px-4 py-2 text-xs text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ── Display mode ── */
                          <div className="flex">
                            {/* Image */}
                            <div className="relative w-32 shrink-0 overflow-hidden bg-slate-900">
                              {h.imageUrl ? (
                                <img src={h.imageUrl} alt={h.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <span className="text-2xl font-bold text-amber-500/15">
                                    {h.name.split(" ").filter((w) => w.length > 1).slice(0, 2).map((w) => w[0]).join("")}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Content */}
                            <div className="flex flex-1 items-start justify-between gap-3 p-4">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-amber-500">{h.name}</p>
                                {h.title && <p className="text-xs text-slate-500">{h.title}</p>}
                                {h.quote && <p className="mt-2 text-xs leading-relaxed text-slate-400 italic">&ldquo;{h.quote}&rdquo;</p>}
                              </div>
                              <div className="flex shrink-0 gap-1 opacity-0 transition-all group-hover:opacity-100">
                                <button
                                  onClick={() => {
                                    setEditingHaskamaId(h.id);
                                    setEditingHaskama({ name: h.name, title: h.title, quote: h.quote });
                                  }}
                                  className="rounded p-1.5 text-slate-600 hover:text-amber-400"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteHaskama(h.id)}
                                  className="rounded p-1.5 text-slate-600 hover:text-red-400"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : isMessages ? (
              /* ─── MESSAGES ─── */
              <div>
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                  </div>
                )}

                {!loading && messages.length === 0 && (
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-12 text-center">
                    <Mail className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                    <p className="text-sm text-slate-500">No messages yet. Submissions from the contact form will appear here.</p>
                  </div>
                )}

                {messages.length > 0 && (
                  <div>
                    <p className="mb-4 text-sm text-slate-500">
                      {messages.length} message{messages.length !== 1 ? "s" : ""}
                      {messages.filter((m) => !m.read).length > 0 && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                          {messages.filter((m) => !m.read).length} new
                        </span>
                      )}
                    </p>
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`group rounded-xl border transition-all ${
                            msg.read
                              ? "border-white/[0.06] bg-white/[0.02]"
                              : "border-amber-500/20 bg-amber-500/[0.03]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4 p-4">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <p className="text-sm font-semibold text-white">{msg.name}</p>
                                {!msg.read && (
                                  <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">NEW</span>
                                )}
                              </div>
                              <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                                <a href={`mailto:${msg.email}`} className="hover:text-amber-400">{msg.email}</a>
                                {msg.phone && <span>{msg.phone}</span>}
                                <span className="text-slate-600">{new Date(msg.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{msg.message}</p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              {!msg.read && (
                                <button
                                  onClick={() => markRead(msg.id)}
                                  className="rounded p-1.5 text-slate-600 transition-colors hover:text-amber-400"
                                  title="Mark as read"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="rounded p-1.5 text-slate-600 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ─── GENERIC FILE UPLOAD ─── */
              <div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`mb-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all ${
                    dragOver
                      ? "border-amber-500/50 bg-amber-500/5"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]"
                  }`}
                >
                  {uploading ? (
                    <Loader2 className="mb-3 h-8 w-8 animate-spin text-amber-500" />
                  ) : (
                    <Upload className="mb-3 h-8 w-8 text-slate-500" />
                  )}
                  <p className="mb-2 text-sm text-slate-300">
                    {uploading
                      ? "Uploading..."
                      : "Drag & drop an image here, or click to browse"}
                  </p>
                  <p className="mb-4 text-xs text-slate-500">
                    PNG, JPG, WebP up to 10MB
                  </p>
                  {uploadError && (
                    <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
                      {uploadError}
                    </p>
                  )}
                  <label className="cursor-pointer rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFile(file);
                      }}
                    />
                  </label>
                </div>

                {files.length === 0 && !loading && (
                  <button
                    onClick={() => loadFiles()}
                    className="mb-8 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-4 text-sm text-slate-400 transition-colors hover:border-white/[0.15] hover:text-white"
                  >
                    Load existing images from &ldquo;{activeFolder}&rdquo;
                  </button>
                )}

                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                  </div>
                )}

                {files.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {files.map((file) => (
                      <div
                        key={file.url}
                        className="group overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12]"
                      >
                        <div className="relative aspect-square overflow-hidden bg-slate-900">
                          <img
                            src={file.url}
                            alt={file.pathname}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => copyUrl(file.url)}
                              className="rounded-lg bg-white/10 p-2.5 backdrop-blur-sm transition-colors hover:bg-white/20"
                              title="Copy URL"
                            >
                              {copiedUrl === file.url ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteFile(file.url)}
                              className="rounded-lg bg-red-500/20 p-2.5 backdrop-blur-sm transition-colors hover:bg-red-500/40"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <div className="px-3 py-2.5">
                          <p className="truncate text-xs text-slate-400">
                            {file.pathname}
                          </p>
                          <p className="text-xs text-slate-600">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
