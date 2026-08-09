import { useRef, useState } from "react";
import Papa from "papaparse";
import { AlertTriangle, Download, UploadCloud } from "lucide-react";
import { downloadCsv, guessColumnMapping } from "../../utils/csv";
import ColumnMappingModal from "./ColumnMappingModal";

export default function CsvImportPanel({
  icon: Icon,
  title,
  description,
  accent = "#E31837",
  fields,
  templateFilename,
  templateHeaders,
  templateSampleRow,
  transformRow,
  onImport,
  successMessage,
  onSuccess,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [uploadId, setUploadId] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [mappingOpen, setMappingOpen] = useState(false);

  const parseFile = (file) => {
    setError("");
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Whoops! Please upload a .csv file.");
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedHeaders = results.meta.fields || [];
        if (parsedHeaders.length === 0 || results.data.length === 0) {
          setError("That file looks empty — make sure it has a header row and at least one row of data.");
          return;
        }
        setHeaders(parsedHeaders);
        setRawRows(results.data);
        setUploadId((id) => id + 1);
        setMappingOpen(true);
      },
      error: () => setError("Whoops! We couldn't read that file. Please upload a valid .csv file."),
    });
  };

  const handleFiles = (files) => parseFile(files?.[0]);

  const handleConfirm = (mapping) => {
    const rows = rawRows
      .map((row) => {
        const mapped = {};
        fields.forEach((field) => {
          mapped[field.key] = mapping[field.key] ? row[mapping[field.key]] : "";
        });
        return transformRow(mapped);
      })
      .filter(Boolean);

    const count = onImport(rows);
    setMappingOpen(false);
    setRawRows([]);
    setHeaders([]);
    onSuccess(successMessage(count));
  };

  const handleDownloadTemplate = () => downloadCsv(templateFilename, templateHeaders, [templateSampleRow]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1a`, color: accent }}>
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>
      </div>

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
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragOver ? "border-current bg-current/5" : "border-gray-200 bg-gray-50 hover:border-gray-300"
        }`}
        style={dragOver ? { color: accent } : undefined}
      >
        <UploadCloud size={22} className="text-gray-400" />
        <p className="text-xs font-semibold text-gray-600">Drag & drop a .csv file, or click to browse</p>
        <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500">
          <AlertTriangle size={13} /> {error}
        </p>
      )}

      <button
        onClick={handleDownloadTemplate}
        className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600"
      >
        <Download size={12} /> Download Template
      </button>

      <ColumnMappingModal
        key={uploadId}
        open={mappingOpen}
        onClose={() => setMappingOpen(false)}
        headers={headers}
        fields={fields}
        initialMapping={guessColumnMapping(headers, fields)}
        rowCount={rawRows.length}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
