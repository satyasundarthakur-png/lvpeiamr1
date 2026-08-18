import { useRef, useState } from "react";
import type { InfectionRecord } from "./data";
import { parseFile } from "./dataImport";

interface Props {
  onImport: (records: InfectionRecord[]) => void;
  onReset: () => void;
  usingUploadedData: boolean;
  recordCount: number;
}

export default function UploadPanel({ onImport, onReset, usingUploadedData, recordCount }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    setStatus({ type: "idle", message: "" });
    try {
      const records = await parseFile(file);
      onImport(records);
      setStatus({ type: "success", message: `Imported ${records.length} record(s) from "${file.name}".` });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to parse file." });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 shadow-lg mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-slate-200 font-medium">Import Data</h3>
          <p className="text-slate-400 text-sm mt-1">
            Upload an Excel (.xlsx, .xls) or CSV file of infection records. This{" "}
            <span className="text-slate-200 font-medium">replaces</span> the data currently shown below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-medium text-sm px-4 py-2 transition"
          >
            {loading ? "Importing…" : "Upload File"}
          </button>
          {usingUploadedData && (
            <button
              onClick={onReset}
              className="rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 text-sm px-4 py-2 transition"
            >
              Reset to Sample Data
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="text-slate-500">
          Currently showing {recordCount} record(s) &middot;{" "}
          {usingUploadedData ? "your uploaded data" : "sample data"}
        </span>
        {status.type === "success" && <span className="text-emerald-400">{status.message}</span>}
        {status.type === "error" && <span className="text-red-400">{status.message}</span>}
      </div>

      <details className="mt-3 text-xs text-slate-500">
        <summary className="cursor-pointer hover:text-slate-400">Expected column headers</summary>
        <p className="mt-2 leading-relaxed">
          patientId, admissionDate, campus (or hospitalId), department (or sub-specialty), procedure, wardType
          (or ward/OT), infectionType, clinicalDiagnosis, comorbidity, devicesUsed, gender, age, district, state,
          locationType. Header names are matched flexibly (case/spacing-insensitive) — unrecognized columns are
          ignored, and missing ones are left blank.
        </p>
      </details>
    </div>
  );
}
