import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { sampleRecords, type InfectionRecord } from "@/data/infectionRecords";
import { loadSavedRecords, saveRecords, clearSavedRecords } from "@/dataImport";
import UploadPanel from "@/UploadPanel";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Ophthalmic Infection & AMR Surveillance Dashboard" },
      {
        name: "description",
        content:
          "Monitor post-surgical infections, endophthalmitis and AMR trends across operation theatres and campuses of a tertiary care eye hospital.",
      },
      { property: "og:title", content: "Ophthalmic Infection & AMR Surveillance Dashboard" },
      {
        property: "og:description",
        content:
          "Post-surgical infection and endophthalmitis surveillance across OTs, wards and campuses of a tertiary eye hospital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24", "#34d399", "#60a5fa"];
const TOOLTIP_STYLE = { background: "#0f172a", border: "1px solid #334155", borderRadius: 12 };

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur">
      <h3 className="mb-4 font-medium text-slate-200">{title}</h3>
      {children}
    </div>
  );
}

function countBy(rows: InfectionRecord[], key: (r: InfectionRecord) => string) {
  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    const k = key(r) || "Unknown";
    counts[k] = (counts[k] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function Dashboard() {
  const [records, setRecords] = useState<InfectionRecord[]>(sampleRecords);
  const [usingUploadedData, setUsingUploadedData] = useState(false);
  const [campusFilter, setCampusFilter] = useState("All");
  const [wardFilter, setWardFilter] = useState("All");

  useEffect(() => {
    const saved = loadSavedRecords();
    if (saved && saved.length > 0) {
      setRecords(saved);
      setUsingUploadedData(true);
    }
  }, []);

  function handleImport(newRecords: InfectionRecord[]) {
    setRecords(newRecords);
    setUsingUploadedData(true);
    saveRecords(newRecords);
    setWardFilter("All");
    setCampusFilter("All");
  }

  function handleReset() {
    setRecords(sampleRecords);
    setUsingUploadedData(false);
    clearSavedRecords();
    setWardFilter("All");
    setCampusFilter("All");
  }

  const campuses = useMemo(
    () => ["All", ...Array.from(new Set(records.map((r) => r.hospitalId).filter(Boolean)))],
    [records],
  );
  const wards = useMemo(
    () => ["All", ...Array.from(new Set(records.map((r) => r.wardType).filter(Boolean)))],
    [records],
  );

  const filtered = useMemo(
    () =>
      records.filter(
        (r) =>
          (campusFilter === "All" || r.hospitalId === campusFilter) &&
          (wardFilter === "All" || r.wardType === wardFilter),
      ),
    [records, campusFilter, wardFilter],
  );

  const total = filtered.length;
  const cai = filtered.filter((r) => r.infectionType === "Community Acquired Infection").length;
  const postSurgical = filtered.filter((r) => r.infectionType === "Post-Surgical (HAI)").length;
  const endophthalmitis = filtered.filter((r) => r.infectionType === "Endophthalmitis").length;
  const male = filtered.filter((r) => r.gender === "male").length;
  const female = filtered.filter((r) => r.gender === "female").length;

  const infectionTypeData = useMemo(() => countBy(filtered, (r) => r.infectionType || "Not Known"), [filtered]);
  const wardData = useMemo(() => countBy(filtered, (r) => r.wardType), [filtered]);
  const deptData = useMemo(() => countBy(filtered, (r) => r.department), [filtered]);
  const procedureData = useMemo(() => countBy(filtered, (r) => r.procedure), [filtered]);

  const selectClass =
    "rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-6 text-slate-100 md:p-10">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
            Tertiary Eye Care &middot; AMR Surveillance
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-50 md:text-3xl">
            Ophthalmic Infection &amp; AMR Surveillance Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Post-surgical infection trends, endophthalmitis monitoring and patient demographics across
            operation theatres, wards and campuses of a tertiary care eye hospital.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-400" htmlFor="campus">
            Campus:
          </label>
          <select
            id="campus"
            value={campusFilter}
            onChange={(e) => setCampusFilter(e.target.value)}
            className={selectClass}
          >
            {campuses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="text-sm text-slate-400" htmlFor="ward">
            Ward / OT:
          </label>
          <select
            id="ward"
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className={selectClass}
          >
            {wards.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </header>

      <UploadPanel
        onImport={handleImport}
        onReset={handleReset}
        usingUploadedData={usingUploadedData}
        recordCount={records.length}
      />

      <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="Total Infection Cases" value={total} accent="text-cyan-400" />
        <KpiCard label="Community Acquired (CAI)" value={cai} accent="text-violet-400" />
        <KpiCard label="Post-Surgical Infections" value={postSurgical} accent="text-pink-400" />
        <KpiCard label="Endophthalmitis Cases" value={endophthalmitis} accent="text-rose-400" />
        <KpiCard label="Male / Female" value={`${male} / ${female}`} accent="text-amber-400" />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ChartCard title="Infection Type Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={infectionTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {infectionTypeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="OT / Ward-wise Infection Analysis">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={wardData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={110} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#1e293b55" }} />
              <Bar dataKey="value" fill="#22d3ee" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ChartCard title="Sub-specialty Case Load">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={140} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#1e293b55" }} />
              <Bar dataKey="value" fill="#f472b6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Infections by Surgical Procedure">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={procedureData} margin={{ bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                tick={{ fontSize: 10 }}
                angle={-20}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#1e293b55" }} />
              <Bar dataKey="value" fill="#a78bfa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
        <h3 className="mb-4 font-medium text-slate-200">
          Case Records <span className="text-sm text-slate-500">({total})</span>
        </h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2 pr-4">Patient</th>
              <th className="py-2 pr-4">Gender / Age</th>
              <th className="py-2 pr-4">Campus</th>
              <th className="py-2 pr-4">Sub-specialty</th>
              <th className="py-2 pr-4">Procedure</th>
              <th className="py-2 pr-4">OT / Ward</th>
              <th className="py-2 pr-4">Infection Type</th>
              <th className="py-2 pr-4">Admission Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                <td className="whitespace-nowrap py-2 pr-4 text-slate-300">#{r.patientId}</td>
                <td className="whitespace-nowrap py-2 pr-4 capitalize text-slate-300">
                  {r.gender}, {r.age}
                </td>
                <td className="whitespace-nowrap py-2 pr-4 text-slate-300">{r.hospitalId}</td>
                <td className="whitespace-nowrap py-2 pr-4 text-slate-300">{r.department}</td>
                <td className="whitespace-nowrap py-2 pr-4 text-slate-300">{r.procedure}</td>
                <td className="whitespace-nowrap py-2 pr-4 text-slate-300">{r.wardType}</td>
                <td className="whitespace-nowrap py-2 pr-4 text-slate-300">{r.infectionType}</td>
                <td className="whitespace-nowrap py-2 pr-4 text-slate-300">{r.admissionDate}</td>
              </tr>
            ))}
            {total === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
                  No records match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <footer className="mt-8 text-center text-xs text-slate-600">
        Sample surveillance dataset modeled on a tertiary care eye hospital&rsquo;s OT and campus structure. For
        demonstration purposes only &mdash; not real patient data.
      </footer>
    </div>
  );
}
