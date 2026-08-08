import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export default function Dropzone({ onFile, label, hint, preview, icon: Icon = UploadCloud, accent = "#E31837" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 text-center transition ${
        dragOver ? "border-current bg-current/5" : "border-gray-300 bg-gray-50 hover:border-gray-400"
      }`}
      style={dragOver ? { color: accent } : undefined}
    >
      {preview ? (
        <img src={preview} alt="preview" className="h-24 w-24 rounded-2xl object-cover shadow-md" />
      ) : (
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon size={26} />
        </span>
      )}
      <div>
        <p className="text-sm font-bold text-gray-800">{label}</p>
        {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
