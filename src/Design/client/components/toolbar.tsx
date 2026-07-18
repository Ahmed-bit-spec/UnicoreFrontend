import { useState } from "react";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Save,
  ChevronDown,
  Home,
} from "lucide-react";
import { useEditor, CANVAS_SIZES } from "../context";

export function Toolbar() {
  const {
    canvasWidth,
    canvasHeight,
    setCanvasSize,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    fitScale,
    zoomToFit,
    zoomIn,
    zoomOut,
    exportPNG,
    saveDesign,
    saving,
    activeDesign,
    renameDesign,
    navigate,
  } = useEditor();

  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const currentSize = CANVAS_SIZES.find(
    (s) => s.width === canvasWidth && s.height === canvasHeight
  );
  const sizeLabel = currentSize ? currentSize.label : `${canvasWidth} x ${canvasHeight}`;

  const startRename = () => {
    if (!activeDesign) return;
    setNameValue(activeDesign.name);
    setEditingName(true);
  };

  const finishRename = () => {
    if (activeDesign && nameValue.trim()) {
      renameDesign(activeDesign.id, nameValue.trim());
    }
    setEditingName(false);
  };

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-zinc-200 shrink-0">
      {/* Left: Home + Design name + Canvas size */}
      <div className="flex items-center gap-3">

        {activeDesign && (
          editingName ? (
            <input
              className="bg-zinc-100 border border-accent rounded px-2 py-0.5 text-xs text-zinc-900 outline-none w-40"
              value={nameValue}
              onInput={(e) => setNameValue((e.target as HTMLInputElement).value)}
              onBlur={finishRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishRename();
                if (e.key === "Escape") setEditingName(false);
              }}
              autoFocus
            />
          ) : (
            <span
              className="text-xs font-semibold text-zinc-600 cursor-pointer hover:text-zinc-900 transition-colors"
              onDblClick={startRename}
            >
              {activeDesign.name}
            </span>
          )
        )}

        <div className="relative">
          <button
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-400 bg-zinc-100 border border-zinc-300 cursor-pointer hover:text-zinc-900 hover:border-zinc-500 transition-all"
            onClick={() => setShowSizeDropdown(!showSizeDropdown)}
          >
            {sizeLabel}
            <ChevronDown size={12} />
          </button>
          {showSizeDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSizeDropdown(false)} />
              <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-300 rounded-lg shadow-xl z-20 min-w-[200px] py-1">
                {CANVAS_SIZES.map((s) => (
                  <button
                    key={s.label}
                    className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer border-none transition-colors ${
                      s.width === canvasWidth && s.height === canvasHeight
                        ? "bg-accent/20 text-accent"
                        : "text-zinc-600 bg-transparent hover:bg-zinc-100"
                    }`}
                    onClick={() => {
                      setCanvasSize(s.width, s.height);
                      setShowSizeDropdown(false);
                    }}
                  >
                    <span className="font-medium">{s.label}</span>
                    <span className="text-zinc-400 ml-2">
                      {s.width} x {s.height}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded-md text-zinc-400 bg-transparent border-none cursor-pointer transition-all hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Cmd+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="p-1.5 rounded-md text-zinc-400 bg-transparent border-none cursor-pointer transition-all hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      {/* Right: Zoom + Export + Save */}
      <div className="flex items-center gap-1.5">
        <button
          className="p-1.5 rounded-md text-zinc-400 bg-transparent border-none cursor-pointer transition-all hover:bg-zinc-100 hover:text-zinc-900"
          onClick={zoomOut}
          title="Zoom out"
        >
          <ZoomOut size={15} />
        </button>
        <span className="text-[11px] text-zinc-400 font-mono w-10 text-center">
          {Math.round((zoom / (fitScale || 1)) * 100)}%
        </span>
        <button
          className="p-1.5 rounded-md text-zinc-400 bg-transparent border-none cursor-pointer transition-all hover:bg-zinc-100 hover:text-zinc-900"
          onClick={zoomIn}
          title="Zoom in"
        >
          <ZoomIn size={15} />
        </button>
        <button
          className="p-1.5 rounded-md text-zinc-400 bg-transparent border-none cursor-pointer transition-all hover:bg-zinc-100 hover:text-zinc-900"
          onClick={zoomToFit}
          title="Fit to screen"
        >
          <Maximize size={15} />
        </button>

        <div className="w-px h-5 bg-zinc-300 mx-1" />

        <button
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-none cursor-pointer bg-[#58CC02] text-white text-sm font-bold shadow-[0_4px_0_#46A302] hover:translate-y-0.5 hover:shadow-[0_2px_0_#46A302] active:translate-y-1 active:shadow-none transition-all duration-150"
          onClick={exportPNG}
          title="Export as PNG"
        >
          <Download size={13} />
          Export
        </button>
        <button
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-none cursor-pointer bg-[#58CC02] text-white text-sm font-bold shadow-[0_4px_0_#46A302] hover:translate-y-0.5 hover:shadow-[0_2px_0_#46A302] active:translate-y-1 active:shadow-none transition-all duration-150 disabled:opacity-50"
          onClick={saveDesign}
          disabled={saving || !activeDesign}
        >
          {saving ? <span className="spinner !border-white/30 !border-t-white" /> : <Save size={13} />}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
