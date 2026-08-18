import * as XLSX from "xlsx";
import type { InfectionRecord } from "./data";

const STORAGE_KEY = "amr-dashboard-records-v1";

// Maps flexible column header variants (lowercase, trimmed) to InfectionRecord fields
const HEADER_MAP: Record<string, keyof InfectionRecord> = {
  id: "id",
  recordid: "id",
  hospitalid: "hospitalId",
  campus: "hospitalId",
  hospital: "hospitalId",
  patientid: "patientId",
  admissiondate: "admissionDate",
  date: "admissionDate",
  department: "department",
  subspecialty: "department",
  "sub-specialty": "department",
  procedure: "procedure",
  surgicalprocedure: "procedure",
  wardtype: "wardType",
  ward: "wardType",
  "ot/ward": "wardType",
  infectiontype: "infectionType",
  clinicaldiagnosis: "clinicalDiagnosis",
  diagnosis: "clinicalDiagnosis",
  comorbidity: "comorbidity",
  devicesused: "devicesUsed",
  devices: "devicesUsed",
  prioradmission: "priorAdmission",
  gender: "gender",
  sex: "gender",
  age: "age",
  district: "district",
  state: "state",
  locationtype: "locationType",
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_]+/g, "");
}

export function rowsToRecords(rows: Record<string, unknown>[]): InfectionRecord[] {
  return rows.map((row, i) => {
    const rec: Partial<InfectionRecord> = {};
    for (const [rawKey, value] of Object.entries(row)) {
      const norm = normalizeHeader(rawKey);
      const field = HEADER_MAP[norm];
      if (field) {
        rec[field] = value === undefined || value === null ? "" : String(value);
      }
    }
    return {
      id: rec.id || String(i + 1),
      hospitalId: rec.hospitalId || "",
      patientId: rec.patientId || "",
      admissionDate: rec.admissionDate || "",
      department: rec.department || "",
      procedure: rec.procedure || "",
      wardType: rec.wardType || "",
      infectionType: rec.infectionType || "Not Known",
      clinicalDiagnosis: rec.clinicalDiagnosis || "",
      comorbidity: rec.comorbidity || "",
      devicesUsed: rec.devicesUsed || "",
      priorAdmission: rec.priorAdmission || "",
      gender: (rec.gender || "").toLowerCase(),
      age: rec.age || "",
      district: rec.district || "",
      state: rec.state || "",
      locationType: rec.locationType || "",
    };
  });
}

export async function parseFile(file: File): Promise<InfectionRecord[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("No sheet found in the uploaded file.");
  }
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (rows.length === 0) {
    throw new Error("No rows found in the first sheet of the uploaded file.");
  }
  return rowsToRecords(rows);
}

export function saveRecords(records: InfectionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function loadSavedRecords(): InfectionRecord[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSavedRecords() {
  localStorage.removeItem(STORAGE_KEY);
}
