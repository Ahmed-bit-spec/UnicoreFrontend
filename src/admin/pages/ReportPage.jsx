import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import { fetchReport, downloadReportPdf, downloadReportExcel } from "../../api/reportApi";

/* ────────────────────────────────────────────────────────────────
   Uniso Reports — real data, real exports.
   Replaces the AI Intelligence Center's canned demoResponse chat.
   The "Explain with AI" action is intentionally stubbed: this is a
   v2 feature and should not pretend to work in the meantime.
   ──────────────────────────────────────────────────────────────── */

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

function DuoButton({ children, onClick, disabled, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-[#58CC02] text-white text-sm font-bold rounded-2xl px-5 py-3
        shadow-[0_4px_0_#46A302] hover:translate-y-0.5 hover:shadow-[0_2px_0_#46A302]
        active:translate-y-1 active:shadow-none transition-all duration-150
        inline-flex items-center justify-center gap-2 select-none
        disabled:opacity-50 disabled:pointer-events-none
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function DeltaBadge({ pct }) {
  const positive = pct >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold"
      style={{ color: positive ? "#58A700" : "#C0392B" }}
    >
      <Icon size={12} />
      {positive ? "+" : ""}
      {pct}%
    </span>
  );
}

function KpiCard({ label, value, deltaPct, icon: Icon }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "white", border: "2px solid #E3EED3" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: "#6B7A5E" }}>
          {label}
        </span>
        <Icon size={16} color="#58A700" />
      </div>
      <div className="text-[24px] font-extrabold" style={{ color: "#17390B" }}>
        {value}
      </div>
      {deltaPct !== undefined && (
        <div className="mt-1">
          <DeltaBadge pct={deltaPct} />
        </div>
      )}
    </div>
  );
}

function TrendChart({ trend }) {
  if (!trend?.length) {
    return <p className="text-[13px] font-semibold" style={{ color: "#6B7A5E" }}>No activity recorded yet.</p>;
  }
  const max = Math.max(...trend.map((t) => t.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {trend.map((t) => (
        <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md"
            style={{
              height: `${Math.max((t.count / max) * 100, 4)}%`,
              background: "#58CC02",
            }}
            title={`${t.date}: ${t.count}`}
          />
          <span className="text-[9px] font-semibold" style={{ color: "#9AA98D" }}>
            {t.date.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("daily");
  const [anchorDate, setAnchorDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [downloading, setDownloading] = useState(null); // "pdf" | "excel" | null
  const [showAiNotice, setShowAiNotice] = useState(false);

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ["report", period, anchorDate],
    queryFn: () => fetchReport(period, anchorDate),
    staleTime: 30_000,
  });

  const shiftDate = (dir) => {
    const d = new Date(anchorDate);
    const deltaDays = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
    d.setDate(d.getDate() + dir * deltaDays);
    setAnchorDate(d.toISOString().slice(0, 10));
  };

  const handleDownload = async (kind) => {
    setDownloading(kind);
    try {
      if (kind === "pdf") await downloadReportPdf(period, anchorDate);
      else await downloadReportExcel(period, anchorDate);
    } catch (err) {
      console.error(`Report ${kind} export failed:`, err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }} className="min-h-full p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-[22px] md:text-[26px] font-extrabold"
            style={{ fontFamily: "'Baloo 2', 'Nunito', sans-serif", color: "#17390B" }}
          >
            Library Reports
          </h1>
          <p className="text-[13px] font-semibold" style={{ color: "#6B7A5E" }}>
            Live figures pulled directly from MongoDB — nothing estimated.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DuoButton onClick={() => handleDownload("pdf")} disabled={!report || downloading === "pdf"}>
            <Download size={15} />
            {downloading === "pdf" ? "Preparing…" : "Download PDF"}
          </DuoButton>
          <DuoButton onClick={() => handleDownload("excel")} disabled={!report || downloading === "excel"}>
            <FileSpreadsheet size={15} />
            {downloading === "excel" ? "Preparing…" : "Download Excel"}
          </DuoButton>
        </div>
      </div>

      {/* Period + date controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1 rounded-2xl p-1" style={{ background: "#F0F5E6" }}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="text-[12px] font-bold rounded-xl px-4 py-2 transition-all duration-150"
              style={
                period === p.key
                  ? { background: "#58CC02", color: "white", boxShadow: "0 2px 0 #46A302" }
                  : { color: "#6B7A5E" }
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => shiftDate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg border" style={{ borderColor: "#E3EED3" }}>
            <ChevronLeft size={14} color="#6B7A5E" />
          </button>
          <span className="text-[13px] font-bold" style={{ color: "#17390B" }}>
            {report?.rangeLabel ?? "…"}
          </span>
          <button onClick={() => shiftDate(1)} className="w-8 h-8 flex items-center justify-center rounded-lg border" style={{ borderColor: "#E3EED3" }}>
            <ChevronRight size={14} color="#6B7A5E" />
          </button>
        </div>
      </div>

      {isLoading && <p className="text-[13px] font-semibold" style={{ color: "#6B7A5E" }}>Loading report…</p>}
      {isError && <p className="text-[13px] font-semibold text-red-500">Couldn't load this report. Try again.</p>}

      {report && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Reservations" value={report.summary.totalReservations} deltaPct={report.comparison.totalReservationsChangePct} icon={Clock3} />
            <KpiCard label="Books Borrowed" value={report.summary.totalBorrows} deltaPct={report.comparison.totalBorrowsChangePct} icon={BookOpen} />
            <KpiCard label="Attendance Rate" value={`${report.summary.attendanceRate}%`} deltaPct={report.comparison.attendanceRateChangePct} icon={Users} />
            <KpiCard label="New Students" value={report.summary.newStudents} deltaPct={report.comparison.newStudentsChangePct} icon={Users} />
          </div>

          <div className="flex items-center gap-4 mb-6 text-[12px] font-semibold" style={{ color: "#6B7A5E" }}>
            <span className="flex items-center gap-1.5"><AlertTriangle size={13} color="#C0392B" /> {report.summary.overdueBooks} overdue</span>
            <span>{report.summary.noShowCount} no-shows</span>
            <span>{report.summary.cancelledCount} cancelled</span>
          </div>

          {/* Trend */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: "white", border: "2px solid #E3EED3" }}>
            <h3 className="text-[13px] font-extrabold mb-4" style={{ color: "#17390B" }}>Reservations trend</h3>
            <TrendChart trend={report.trend} />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Top books */}
            <div className="rounded-2xl p-5" style={{ background: "white", border: "2px solid #E3EED3" }}>
              <h3 className="text-[13px] font-extrabold mb-3" style={{ color: "#17390B" }}>Top borrowed books</h3>
              {report.topBooks.length === 0 ? (
                <p className="text-[12px] font-semibold" style={{ color: "#6B7A5E" }}>No borrows this period.</p>
              ) : (
                <div className="space-y-2">
                  {report.topBooks.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-[12px]">
                      <span className="font-bold" style={{ color: "#22301A" }}>{i + 1}. {b.title}</span>
                      <span className="font-bold" style={{ color: "#58A700" }}>{b.borrowCount}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Department usage */}
            <div className="rounded-2xl p-5" style={{ background: "white", border: "2px solid #E3EED3" }}>
              <h3 className="text-[13px] font-extrabold mb-3" style={{ color: "#17390B" }}>Usage by department</h3>
              {report.departmentUsage.length === 0 ? (
                <p className="text-[12px] font-semibold" style={{ color: "#6B7A5E" }}>No reservation activity this period.</p>
              ) : (
                <div className="space-y-2">
                  {report.departmentUsage.map((d) => (
                    <div key={d.department}>
                      <div className="flex justify-between text-[12px] font-semibold mb-0.5" style={{ color: "#22301A" }}>
                        <span>{d.department}</span>
                        <span>{d.percent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "#F0F5E6" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${d.percent}%`, background: "#58CC02" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI explain — stubbed for v2, not wired to any fake response */}
          <div className="rounded-2xl p-5" style={{ background: "white", border: "2px dashed #CFE3B8" }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} color="#58A700" />
                <span className="text-[13px] font-extrabold" style={{ color: "#17390B" }}>
                  Explain this report with AI
                </span>
              </div>
              <button
                onClick={() => setShowAiNotice(true)}
                className="text-[12px] font-bold rounded-xl px-4 py-2"
                style={{ background: "#F0F5E6", color: "#58A700" }}
              >
                Try it
              </button>
            </div>
            {showAiNotice && (
              <p className="text-[12px] font-semibold mt-3" style={{ color: "#6B7A5E" }}>
                AI-generated insights are coming in v2. This report's numbers above are already real and
                live — the AI layer will add narrative explanations on top of them later.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}