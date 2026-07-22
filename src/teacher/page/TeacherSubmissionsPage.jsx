import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  FileText, Search, Filter, AlertTriangle, Shield, CheckCircle2,
  ExternalLink, Loader2, RefreshCw, Send, CheckSquare, Eye
} from "lucide-react";

export default function TeacherSubmissionsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selected exam context
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get("examId") || "");

  // Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Filters
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [flagFilter, setFlagFilter]     = useState("all"); // "all", "high_similarity", "violations", "late"

  // Fetch teacher exams to populate selector
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await axios.get("/api/exams/teacher");
        const list = data.data?.exams || [];
        setExams(list);
        if (list.length > 0 && !selectedExamId) {
          setSelectedExamId(list[0]._id);
        }
      } catch (err) {
        toast.error("Failed to fetch exams");
      }
    };
    fetchExams();
  }, [selectedExamId]);

  // Fetch submissions when exam changes
  const fetchSubmissions = async () => {
    if (!selectedExamId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/exams/teacher/${selectedExamId}/submissions`
      );
      setSubmissions(data.data.submissions || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedExamId]);

  // Bulk Publish Results
  const handleBulkPublish = async () => {
    if (!selectedExamId) return;
    try {
      setPublishing(true);
      const { data } = await axios.post(
        `/api/exams/teacher/${selectedExamId}/submissions/bulk-publish`
      );
      toast.success(`Published ${data.data.modifiedCount} submission results!`);
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to bulk publish");
    } finally {
      setPublishing(false);
    }
  };

  // Filter logic
  const filtered = submissions.filter((sub) => {
    const student = sub.studentId || {};
    const nameMatch = student.fullName?.toLowerCase().includes(search.toLowerCase());
    const idMatch   = student.studentId?.toLowerCase().includes(search.toLowerCase());

    const matchesSearch = !search || nameMatch || idMatch;
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    let matchesFlags = true;
    if (flagFilter === "high_similarity") {
      matchesFlags = sub.similarity >= 70;
    } else if (flagFilter === "violations") {
      matchesFlags = sub.cheatingLogs?.length >= 3;
    } else if (flagFilter === "needs_review") {
      matchesFlags = sub.needsReview === true;
    }

    return matchesSearch && matchesStatus && matchesFlags;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 dark:bg-zinc-950 min-h-screen">

      {/* Title / Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-[#2C2DE0]" />
            Grading Workspace
          </h1>
          <p className="text-gray-500 text-sm">
            Select an exam to view, grade, and publish student submissions.
          </p>
        </div>

        {/* Exam selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
          >
            <option value="">-- Choose Exam --</option>
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.title}
              </option>
            ))}
          </select>

          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="p-2 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#2C2DE0]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Quick stats / summary banner */}
      {selectedExamId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800">
          <StatCard label="Total Submissions" value={submissions.length} />
          <StatCard label="Needs Grading"     value={submissions.filter(s => s.status === "manual-review").length} color="orange" />
          <StatCard label="Graded"            value={submissions.filter(s => ["graded", "published"].includes(s.status)).length} color="green" />
          <StatCard label="Published"         value={submissions.filter(s => s.status === "published").length} color="blue" />
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 text-sm focus:outline-none text-gray-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 focus:outline-none font-semibold text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="auto-graded">Auto-Graded</option>
              <option value="manual-review">Needs Review</option>
              <option value="graded">Graded</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Flags */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 border-l border-gray-200 dark:border-zinc-800 pl-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value)}
              className="bg-transparent border-0 focus:outline-none font-semibold text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Submissions</option>
              <option value="high_similarity">Plagiarism Flag (≥70%)</option>
              <option value="violations">Tab/Kiosk Violations</option>
              <option value="needs_review">Needs Review</option>
            </select>
          </div>

          {/* Bulk Publish */}
          <button
            onClick={handleBulkPublish}
            disabled={publishing || submissions.filter(s => ["graded", "auto-graded"].includes(s.status)).length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white rounded-lg transition-colors disabled:opacity-40"
          >
            {publishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Publish Results
          </button>
        </div>
      </div>

      {/* Submissions Grid / List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#2C2DE0]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-500">
          <CheckCircle2 className="w-12 h-12 text-[#2C2DE0] mx-auto mb-3" />
          <p className="font-semibold text-gray-700 dark:text-gray-300">No submissions found</p>
          <p className="text-xs text-gray-400 mt-1">Try relaxing filters or check back later.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-zinc-800/20">
                  <th className="px-6 py-4 text-left">Student</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Similarity</th>
                  <th className="px-6 py-4 text-right">Violations</th>
                  <th className="px-6 py-4 text-right">Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {filtered.map((sub) => {
                  const student = sub.studentId || {};
                  const isFlagged = sub.similarity >= 70;
                  const violationCount = sub.cheatingLogs?.length || 0;

                  return (
                    <tr key={sub._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/10">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {student.fullName || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {student.studentId || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {sub.similarity !== undefined ? (
                          <span className={`font-mono text-xs font-bold ${isFlagged ? "text-red-500" : "text-gray-500"}`}>
                            {sub.similarity}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {violationCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-500 font-bold bg-red-100 dark:bg-red-500/10 px-2 py-0.5 rounded-md">
                            <Shield className="w-3.5 h-3.5" />
                            {violationCount}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-gray-800 dark:text-gray-200">
                        {sub.totalScore !== undefined ? `${sub.totalScore} / ${sub.totalMaxMarks}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/teacher/submissions/${sub._id}?exam=${selectedExamId}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2C2DE0] dark:bg-[#2C2DE0]/10 text-[#2C2DE0] dark:text-[#2C2DE0] rounded-lg hover:bg-[#2C2DE0] dark:hover:bg-[#2C2DE0]/20 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> Grade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    green:  "text-[#2C2DE0] dark:text-[#2C2DE0]",
    orange: "text-orange-500 dark:text-orange-400",
    blue:   "text-blue-500 dark:text-blue-400",
  };
  return (
    <div>
      <p className={`text-2xl font-black ${colors[color] || "text-gray-900 dark:text-white"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    "in-progress":   { label: "In Progress",  cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400" },
    "submitted":     { label: "Submitted",     cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
    "auto-graded":   { label: "Auto-Graded",   cls: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" },
    "manual-review": { label: "Needs Review",  cls: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" },
    "graded":        { label: "Graded",        cls: "bg-[#2C2DE0] text-[#2C2DE0] dark:bg-[#2C2DE0]/10 dark:text-[#2C2DE0]" },
    "published":     { label: "Published",     cls: "bg-[#2C2DE0] text-[#2C2DE0] dark:bg-[#2C2DE0]/20 dark:text-[#2C2DE0]" },
  };
  const c = config[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${c.cls}`}>
      {c.label}
    </span>
  );
}
