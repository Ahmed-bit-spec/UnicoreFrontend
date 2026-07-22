// Inline Facebook-style post composer at top of feed

import React, { useState, useRef } from "react";
import { Image, FileText, Video, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { createPost } from "@/api/Communityapi";
import { Avatar, BTN_PRIMARY, CARD_SURFACE } from "./ui";

const MAX_TEXT = 5000;

const CreatePostComposer = ({ onCreated, onOpenFullEditor }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      onOpenFullEditor?.();
      return;
    }
    if (posting) return;
    setPosting(true);
    setError("");
    try {
      const data = await createPost({ content: content.trim(), image });
      if (data.success) {
        onCreated?.(data.post);
        setContent("");
        clearImage();
      } else {
        setError(t["feed.errorPost"] ?? "Couldn't publish. Please try again.");
      }
    } catch {
      setError(t["feed.errorPost"] ?? "Couldn't publish. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className={`${CARD_SURFACE} p-4 sm:p-5 mb-4`}>
      <div className="flex items-start gap-3">
        <Avatar name={user?.name} photo={user?.photo} size={40} />
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_TEXT))}
            placeholder={t["feed.whatsOnYourMind"] ?? "What's on your mind?"}
            rows={2}
            className="w-full resize-none bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-[14px] sm:text-[15px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#58CC02]/30 focus:border-[#58CC02]/40 transition-all leading-relaxed"
          />

          {imagePreview && (
            <div className="relative mt-3 rounded-xl overflow-hidden">
              <img src={imagePreview} alt="" className="w-full max-h-48 object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1">
              <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                type="button"
                onClick={() => fileRef.current?.click()}
                className="p-2 rounded-lg text-gray-400 hover:text-[#58CC02] hover:bg-[#58CC02]/10 dark:hover:bg-[#58CC02]/15 transition-colors"
                title={t["feed.addImage"] ?? "Add image"}
              >
                <Image size={18} />
              </button>
              <button
                type="button"
                onClick={onOpenFullEditor}
                className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                title={t["feed.addPdf"] ?? "Add PDF"}
              >
                <FileText size={18} />
              </button>
              <button
                type="button"
                onClick={onOpenFullEditor}
                className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
                title={t["feed.addVideo"] ?? "Add video"}
              >
                <Video size={18} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </div>

            <div className="flex items-center gap-2">
              {content.length > 0 && (
                <span className="text-[11px] text-gray-400 tabular-nums">
                  {content.length}/{MAX_TEXT}
                </span>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={posting || !content.trim()}
                className={BTN_PRIMARY}
              >
                {posting ? <Loader2 size={14} className="animate-spin" /> : null}
                {posting ? (t["feed.posting"] ?? "Posting…") : (t["feed.post"] ?? "Post")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostComposer;
