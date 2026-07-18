/**
 * BooksPage.jsx — Library Book Management Module
 * Green / White / Black palette · University admin feel
 * React Query + Axios · Bilingual-ready (all UI text via translation keys)
 * Supports: Physical | E-book | Both formats
 */

import { useState, useRef, useCallback, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  BookOpen, BookMarked, FileText, Search, Filter,
  Plus, Eye, Pencil, Trash2, Upload, X, Check,
  ChevronLeft, ChevronRight, Archive, Package,
  Layers, Hash, User, Tag, MapPin, Copy,
  Download, ExternalLink, AlertTriangle, Loader2,
  Library, BarChart3, BookCopy, Bookmark,
} from "lucide-react";



// ─── API layer ─────────────────────────────────────────────────────────────────
const api = {
  list: (p) => axios.get("/api/v1/admin/books", { params: p }),
  get: (id) => axios.get(`/api/v1/admin/books/${id}`),
  create: (fd) => axios.post("/api/v1/admin/books", fd, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, fd) => axios.put(`/api/v1/admin/books/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => axios.delete(`/api/v1/admin/books/${id}`),
};

// ─── Constants (functions so they receive T from the hook at runtime) ──────────
const getFormatOpts = (T) => [
  { value: "physical", label: T.formatPhysical, icon: BookOpen, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { value: "ebook", label: T.formatEbook, icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { value: "both", label: T.formatBoth, icon: Layers, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
];

const getStatusOpts = (T) => [
  { value: "active", label: T.statusActive, dot: "bg-green-500" },
  { value: "archived", label: T.statusArchived, dot: "bg-gray-400" },
];

const EMPTY_FORM = {
  title: "", author: "", isbn: "", category: "", description: "",
  format: "physical", shelfLocation: "", totalCopies: 1,
  availableCopies: 1, status: "active",
};

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
const fmtInfo = (fmt, T) => getFormatOpts(T).find((f) => f.value === fmt) || getFormatOpts(T)[0];

const FormatBadge = ({ format, T }) => {
  const f = fmtInfo(format, T);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${f.bg} ${f.color}`}>
      <f.icon size={9} />
      {f.label}
    </span>
  );
};

const StatusDot = ({ status, T }) => {
  const s = getStatusOpts(T).find((o) => o.value === status) || getStatusOpts(T)[0];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
      <span className={`size-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── File drop zone ────────────────────────────────────────────────────────────
const DropZone = ({ accept, label, hint, icon: Icon, preview, onFile, onClear, T }) => {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handle = (file) => { if (file) onFile(file); };

  return (
    <div
      className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none
        ${drag ? "border-green-400 bg-green-50 dark:bg-green-500/10" : "border-gray-200 dark:border-white/10 hover:border-green-300 dark:hover:border-green-600"}
        ${preview ? "p-2" : "p-5"}`}
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={(e) => handle(e.target.files[0])} />

      {preview ? (
        <div className="relative">
          {accept.includes("image") ? (
            <img src={preview} alt="cover" className="w-full h-40 object-cover rounded-xl" />
          ) : (
            <div className="flex items-center gap-3 px-3 py-3 bg-green-50 dark:bg-green-500/10 rounded-xl">
              <FileText size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 truncate">{T.pdfAvailable}</span>
            </div>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className={`size-10 rounded-xl flex items-center justify-center ${drag ? "bg-green-100 dark:bg-green-500/20" : "bg-gray-100 dark:bg-white/5"}`}>
            <Icon size={18} className={drag ? "text-green-600" : "text-gray-400"} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{label}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{hint}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Book cover placeholder ────────────────────────────────────────────────────
const CoverImg = ({ src, title, size = "md" }) => {
  const [err, setErr] = useState(false);
  const s = size === "sm" ? "size-10 rounded-xl text-[8px]" : size === "lg" ? "w-32 h-44 rounded-2xl text-xs" : "size-12 rounded-xl text-[9px]";

  if (!src || err) {
    return (
      <div className={`${s} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border border-gray-200 dark:border-white/10 overflow-hidden flex-shrink-0`}>
        <BookOpen size={size === "lg" ? 28 : 16} className="text-gray-300 dark:text-gray-600" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={title}
      onError={() => setErr(true)}
      className={`${s} object-cover border border-gray-200 dark:border-white/10 flex-shrink-0`}
    />
  );
};

// ─── Form field wrapper ────────────────────────────────────────────────────────
const Field = ({ label, required, children, className = "" }) => (
  <div className={className}>
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all ${className}`}
    {...props}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all resize-none ${className}`}
    {...props}
  />
);

const Select = ({ className = "", children, ...props }) => (
  <select
    className={`w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all ${className}`}
    {...props}
  >
    {children}
  </select>
);

// ─── Overlay modal shell ───────────────────────────────────────────────────────
const ModalShell = ({ open, onClose, title, subtitle, size = "md", children, footer }) => {
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className={`w-full ${widths[size]} bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-start justify-between px-6 pt-6 pb-5 border-b border-gray-100 dark:border-white/10">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">{title}</h3>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="size-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0 ml-4">
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-gray-950 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, accent, sub }) => (
  <div className="flex items-center gap-3.5 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-4">
    <div className={`size-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mt-0.5">{value ?? "—"}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Book form (Add / Edit) ────────────────────────────────────────────────────
const BookForm = ({ initial, onSubmit, isSaving, T }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initial?.coverImage || null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState(initial?.ebookFile ? "existing.pdf" : null);

  const FORMAT_OPTS = getFormatOpts(T);
  const STATUS_OPTS = getStatusOpts(T);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCover = (file) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handlePdf = (file) => {
    setPdfFile(file);
    setPdfName(file.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (coverFile) fd.append("coverImage", coverFile);
    if (pdfFile) fd.append("ebookFile", pdfFile);
    onSubmit(fd);
  };

  const needsPdf = ["ebook", "both"].includes(form.format);
  const needsShelf = ["physical", "both"].includes(form.format);
  const needsCopies = ["physical", "both"].includes(form.format);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Cover + basic info */}
      <div className="flex gap-4">
        {/* Cover drop zone */}
        <div className="w-32 flex-shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">{T.actionUploadCover}</p>
          <DropZone
            accept="image/*"
            label={T.dropCover}
            hint={T.coverFormats}
            icon={Upload}
            preview={coverPreview}
            onFile={handleCover}
            onClear={() => { setCoverFile(null); setCoverPreview(null); }}
            T={T}
          />
        </div>

        {/* Title + Author */}
        <div className="flex-1 space-y-3">
          <Field label={T.fieldTitle} required>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={T.phTitle} required />
          </Field>
          <Field label={T.fieldAuthor} required>
            <Input value={form.author} onChange={(e) => set("author", e.target.value)} placeholder={T.phAuthor} required />
          </Field>
        </div>
      </div>

      {/* ISBN + Category */}
      <div className="grid grid-cols-2 gap-3">
        <Field label={T.fieldISBN}>
          <Input value={form.isbn} onChange={(e) => set("isbn", e.target.value)} placeholder={T.phISBN} />
        </Field>
        <Field label={T.fieldCategory}>
          <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder={T.phCategory} />
        </Field>
      </div>

      {/* Description */}
      <Field label={T.fieldDescription}>
        <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={T.phDescription} />
      </Field>

      {/* Format selector — button group */}
      <Field label={T.fieldFormat} required>
        <div className="grid grid-cols-3 gap-2">
          {FORMAT_OPTS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("format", opt.value)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${form.format === opt.value
                ? "bg-green-500 border-green-500 text-white shadow-sm"
                : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-green-300 dark:hover:border-green-700"
                }`}
            >
              <opt.icon size={13} />
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Physical fields */}
      {needsShelf && (
        <div className="grid grid-cols-3 gap-3">
          <Field label={T.fieldShelf} className="col-span-1">
            <Input value={form.shelfLocation} onChange={(e) => set("shelfLocation", e.target.value)} placeholder={T.phShelf} />
          </Field>
          {needsCopies && (
            <>
              <Field label={T.fieldTotal}>
                <Input type="number" min={0} value={form.totalCopies}
                  onChange={(e) => set("totalCopies", Number(e.target.value))} />
              </Field>
              <Field label={T.fieldAvailable}>
                <Input type="number" min={0} max={form.totalCopies} value={form.availableCopies}
                  onChange={(e) => set("availableCopies", Number(e.target.value))} />
              </Field>
            </>
          )}
        </div>
      )}

      {/* PDF upload */}
      {needsPdf && (
        <Field label={T.actionUploadPdf}>
          <DropZone
            accept="application/pdf"
            label={T.dropPdf}
            hint={T.pdfFormat}
            icon={FileText}
            preview={pdfName ? "pdf" : null}
            onFile={handlePdf}
            onClear={() => { setPdfFile(null); setPdfName(null); }}
            T={T}
          />
        </Field>
      )}

      {/* Status */}
      <Field label={T.fieldStatus}>
        <div className="flex gap-2">
          {STATUS_OPTS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("status", opt.value)}
              className={`flex items-center gap-2 flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${form.status === opt.value
                ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900 shadow-sm"
                : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                } justify-center`}
            >
              <span className={`size-2 rounded-full ${opt.dot}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Submit button (inside form, trigger from footer) */}
      <button type="submit" id="book-form-submit" className="hidden" />
    </form>
  );
};

// ─── View modal ────────────────────────────────────────────────────────────────
const ViewModal = ({ book, open, onClose, onEdit, T }) => {
  if (!book) return null;
  const fmt = fmtInfo(book.format, T);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={T.modalView}
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            {T.close}
          </button>
          <button
            onClick={() => { onClose(); onEdit(book); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm"
          >
            <Pencil size={13} /> {T.actionEdit}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Hero row */}
        <div className="flex gap-5">
          <CoverImg src={book.coverImage} title={book.title} size="lg" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start gap-2 flex-wrap">
              <FormatBadge format={book.format} T={T} />
              <StatusDot status={book.status} T={T} />
            </div>
            <h2 className="text-base font-black text-gray-900 dark:text-white leading-snug">{book.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
            {book.category && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-lg">
                <Tag size={9} /> {book.category}
              </span>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {book.isbn && (
            <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">{T.fieldISBN}</p>
              <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{book.isbn}</p>
            </div>
          )}
          {book.shelfLocation && (
            <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">{T.fieldShelf}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <MapPin size={12} className="text-green-500" /> {book.shelfLocation}
              </p>
            </div>
          )}
          {["physical", "both"].includes(book.format) && (
            <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">{T.colCopies}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                <span className="text-green-600 dark:text-green-400">{book.availableCopies}</span>
                <span className="text-gray-400"> / {book.totalCopies} {T.copies}</span>
              </p>
            </div>
          )}
          {["ebook", "both"].includes(book.format) && (
            <div className={`rounded-xl border px-4 py-3 ${book.ebookFile ? "border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10" : "border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]"}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">PDF</p>
              {book.ebookFile ? (
                <a href={book.ebookFile} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400 hover:underline">
                  <Download size={13} /> {T.pdfAvailable}
                </a>
              ) : (
                <p className="text-sm text-gray-400">{T.pdfNone}</p>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {book.description && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{T.fieldDescription}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{book.description}</p>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

// ─── Confirm delete modal ──────────────────────────────────────────────────────
const DeleteModal = ({ book, open, onClose, onConfirm, isDeleting, T }) => (
  <ModalShell
    open={open}
    onClose={onClose}
    title={T.modalDelete}
    size="sm"
    footer={
      <>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
          {T.actionCancel}
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isDeleting ? T.deleting : T.actionConfirm}
        </button>
      </>
    }
  >
    <div className="flex flex-col items-center text-center gap-4 py-2">
      <div className="size-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {T.deleteConfirm} <span className="text-red-500">"{book?.title}"</span>?
        </p>
        <p className="text-xs text-gray-400 mt-1">{T.deleteWarning}</p>
      </div>
    </div>
  </ModalShell>
);

// ─── Filter pill ───────────────────────────────────────────────────────────────
const FilterPill = ({ label, value, options, onChange }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 cursor-pointer"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <Filter size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────
const BooksPage = () => {
  const { t } = useLanguage();
  const T = t.adminBooks;
  const queryClient = useQueryClient();

  // UI state
  const [search, setSearch] = useState("");
  const [fmtFlt, setFmtFlt] = useState("all");
  const [stsFlt, setStsFlt] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Modal state
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null); // null = closed, {} = add, {book} = edit
  const [deleting, setDeleting] = useState(null);

  const params = useMemo(() => ({
    page, limit, search: search || undefined,
    format: fmtFlt !== "all" ? fmtFlt : undefined,
    status: stsFlt !== "all" ? stsFlt : undefined,
  }), [page, limit, search, fmtFlt, stsFlt]);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-books", params],
    queryFn: async () => (await api.list(params)).data,
    keepPreviousData: true,
  });

  const books = data?.books ?? data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: books.length };
  const stats = data?.stats ?? {};

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-books"] });
  const errMsg = (e) => e?.response?.data?.message || T.toastError;

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: (fd) => api.create(fd),
    onSuccess: () => { toast.success(T.toastAdded); setEditing(null); invalidate(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, fd }) => api.update(id, fd),
    onSuccess: () => { toast.success(T.toastUpdated); setEditing(null); invalidate(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.remove(id),
    onSuccess: () => { toast.success(T.toastDeleted); setDeleting(null); invalidate(); },
    onError: (e) => toast.error(errMsg(e)),
  });

  const isSaving = createMut.isPending || updateMut.isPending;

  const handleFormSubmit = (fd) => {
    if (editing?._id) {
      updateMut.mutate({ id: editing._id, fd });
    } else {
      createMut.mutate(fd);
    }
  };

  // Debounced search
  const searchTimer = useRef();
  const handleSearch = useCallback((v) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(v); setPage(1); }, 350);
  }, []);

  // CSV Export
  const exportBooksCsv = () => {
    if (!books?.length) {
      toast.error(T.toastError);
      return;
    }

    const formatLabels = { physical: T.formatPhysical, ebook: T.formatEbook, both: T.formatBoth };
    const statusLabels = { active: T.statusActive, archived: T.statusArchived };

    const headers = [
      T.colBook,
      "Author",
      T.colISBN,
      T.colCategory,
      T.colFormat,
      T.colCopies,
      T.colStatus,
    ];

    const values = books.map((book) => {
      const copiesDisplay = ["physical", "both"].includes(book.format)
        ? `${book.availableCopies} / ${book.totalCopies}`
        : book.ebookFile
          ? "PDF"
          : "—";
      return [
        book.title || "",
        book.author || "",
        book.isbn || "",
        book.category || "",
        formatLabels[book.format] || book.format || "",
        copiesDisplay,
        statusLabels[book.status] || book.status || "",
      ];
    });

    const escapeCell = (cell) => {
      const value = String(cell ?? "");
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csv = [headers, ...values]
      .map((rowData) => rowData.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `books-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(T.toastSuccess);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7 pb-10">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Library size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">{T.pageTitle}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{T.pageSubtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setEditing({})}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-all shadow-sm shadow-green-500/20"
        >
          <Plus size={16} />
          {T.actionAdd}
        </button>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label={T.statsTotal} value={stats.total ?? pagination.total} icon={BookCopy} accent="bg-gray-800 dark:bg-gray-700" />
        <StatCard label={T.statsPhysical} value={stats.physical} icon={BookOpen} accent="bg-emerald-600" />
        <StatCard label={T.statsEbook} value={stats.ebook} icon={FileText} accent="bg-blue-600" />
        <StatCard label={T.statsBoth} value={stats.both} icon={Layers} accent="bg-violet-600" />
        <StatCard label={T.statsActive} value={stats.active} icon={Bookmark} accent="bg-green-500" />
        <StatCard label={T.statsArchived} value={stats.archived} icon={Archive} accent="bg-red-500" />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-56">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={T.searchPlaceholder}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
          />
        </div>

        <FilterPill
          label={T.filterFormat}
          value={fmtFlt}
          onChange={(v) => { setFmtFlt(v); setPage(1); }}
          options={[
            { value: "all", label: `${T.filterFormat}: ${T.filterAll}` },
            { value: "physical", label: T.formatPhysical },
            { value: "ebook", label: T.formatEbook },
            { value: "both", label: T.formatBoth },
          ]}
        />
        <FilterPill
          label={T.filterStatus}
          value={stsFlt}
          onChange={(v) => { setStsFlt(v); setPage(1); }}
          options={[
            { value: "all", label: `${T.filterStatus}: ${T.filterAll}` },
            { value: "active", label: T.statusActive },
            { value: "archived", label: T.statusArchived },
          ]}
        />

        {/* Export button */}
        <button
          onClick={exportBooksCsv}
          disabled={books.length === 0}
          title={T.actionExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Download size={14} />
          <span className="text-xs font-semibold hidden sm:inline">{T.actionExport}</span>
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} className="animate-spin text-green-500" />
            <span className="text-sm text-gray-400">{T.loading}</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 gap-2 text-red-400">
            <AlertTriangle size={16} /> <span className="text-sm">{T.toastError}</span>
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="size-14 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <BookOpen size={22} className="text-gray-300 dark:text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{T.emptyTitle}</p>
              <p className="text-xs text-gray-400 mt-0.5">{T.emptyDesc}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  {[T.colBook, T.colISBN, T.colCategory, T.colFormat, T.colCopies, T.colStatus, T.colActions].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {books.map((book, i) => (
                    <motion.tr
                      key={book._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 dark:border-white/[0.04] hover:bg-gray-50/70 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      onClick={() => setViewing(book)}
                    >
                      {/* Book col */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <CoverImg src={book.coverImage} title={book.title} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[180px]">{book.title}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      {/* ISBN */}
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{book.isbn || "—"}</span>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        {book.category ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-lg">
                            {book.category}
                          </span>
                        ) : <span className="text-[10px] text-gray-300 dark:text-gray-700">—</span>}
                      </td>
                      {/* Format */}
                      <td className="px-4 py-3"><FormatBadge format={book.format} T={T} /></td>
                      {/* Copies */}
                      <td className="px-4 py-3">
                        {["physical", "both"].includes(book.format) ? (
                          <div className="text-xs">
                            <span className="font-bold text-green-600 dark:text-green-400">{book.availableCopies}</span>
                            <span className="text-gray-400"> / {book.totalCopies}</span>
                          </div>
                        ) : (
                          book.ebookFile
                            ? <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"><FileText size={10} /> PDF</span>
                            : <span className="text-[10px] text-gray-300 dark:text-gray-700">—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3"><StatusDot status={book.status} T={T} /></td>
                      {/* Actions */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewing(book)}
                            className="size-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition-colors"
                            title={T.actionView}>
                            <Eye size={13} />
                          </button>
                          <button onClick={() => setEditing(book)}
                            className="size-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            title={T.actionEdit}>
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleting(book)}
                            className="size-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            title={T.actionDelete}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/10">
            <span className="text-[11px] text-gray-400">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} books
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="size-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(pagination.totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`size-8 rounded-lg text-xs font-bold transition-all ${pg === page
                      ? "bg-green-500 text-white shadow-sm"
                      : "border border-gray-200 dark:border-white/10 text-gray-500 hover:border-green-400 hover:text-green-600"
                      }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="size-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-500 hover:border-green-400 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── View modal ─────────────────────────────────────────────────── */}
      <ViewModal
        book={viewing}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        onEdit={(b) => setEditing(b)}
        T={T}
      />

      {/* ── Add / Edit modal ───────────────────────────────────────────── */}
      <ModalShell
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?._id ? T.modalEdit : T.modalAdd}
        subtitle={editing?._id ? editing.title : undefined}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              {T.actionCancel}
            </button>
            <button
              onClick={() => document.getElementById("book-form-submit").click()}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white transition-colors shadow-sm"
            >
              {isSaving
                ? <><Loader2 size={13} className="animate-spin" /> {T.saving}</>
                : <><Check size={13} /> {editing?._id ? T.actionUpdate : T.actionSave}</>
              }
            </button>
          </>
        }
      >
        {editing !== null && (
          <BookForm
            key={editing?._id || "new"}
            initial={editing?._id ? editing : null}
            onSubmit={handleFormSubmit}
            isSaving={isSaving}
            T={T}
          />
        )}
      </ModalShell>

      {/* ── Delete confirm ──────────────────────────────────────────────── */}
      <DeleteModal
        book={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMut.mutate(deleting._id)}
        isDeleting={deleteMut.isPending}
        T={T}
      />
    </div>
  );
};

export default BooksPage;
