import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Map, Plus, Heart, ChevronRight, BookOpen, ListOrdered } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { listRoadmaps } from "@/api/roadmapApi";
import RoadmapCreator from "./RoadmapCreator";
import { Avatar, AuthorName, Tag, Spinner, timeAgo } from "./ui";
import { DUO_BUTTON, DUO_BUTTON_FLAT } from "@/utils/Duo";

const Roadmaps = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const params = filter === "mine" ? { mine: "true" } : {};
      const data = await listRoadmaps(params);
      if (data.success) setRoadmaps(data.roadmaps ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const canCreate = ["teacher", "admin"].includes(user?.role);
  const showMineFilter = canCreate;

  return (
    <div className="w-full px-4 sm:px-6 py-6" style={{ fontFamily: "'Geist Variable', 'Inter', sans-serif" }}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Map size={20} className="text-green-500" />
          <h1 className="text-lg font-black text-gray-900 dark:text-white">
            {t["sidebar.roadmaps"] ?? "Roadmaps"}
          </h1>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreatorOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl ${DUO_BUTTON}`}
          >
            <Plus size={16} />
            Create
          </button>
        )}
      </div>

      {showMineFilter && (
      <div className="flex gap-2 mb-6">
        {["all", "mine"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs ${
              filter === f
                ? DUO_BUTTON_FLAT
                : "font-bold bg-gray-100 dark:bg-gray-900 text-gray-500"
            }`}
          >
            {f === "all" ? "All roadmaps" : "My roadmaps"}
          </button>
        ))}
      </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={20} className="text-green-500" /></div>
      ) : roadmaps.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-500">No roadmaps yet</p>
          <p className="text-xs text-gray-400 mt-1">Step-by-step guides on what to learn, and where to learn it.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {roadmaps.map((rm) => (
            <Link
              key={rm._id}
              to={`/community/roadmaps/${rm._id}`}
              className="block p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-900 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-2xl flex-shrink-0">
                  {rm.icon ?? "🗺️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                      {rm.title}
                    </h2>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-500">
                      <ListOrdered size={10} /> {rm.topicsCount ?? rm.topics?.length ?? 0} topics
                    </span>
                  </div>
                  {rm.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{rm.description}</p>
                  )}

                  {rm.progressPercent > 0 && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="h-1.5 w-32 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${rm.progressPercent}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-green-600">{rm.progressPercent}%</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={rm.author?.name} photo={rm.author?.photo} size={22} />
                      <AuthorName user={rm.author} className="text-xs font-semibold text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(rm.createdAt)}</span>
                    {rm.semesterTag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600">
                        {rm.semesterTag}
                      </span>
                    )}
                    {(rm.likesCount ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Heart size={12} /> {rm.likesCount}
                      </span>
                    )}
                  </div>
                  {rm.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rm.tags.slice(0, 4).map((tag) => <Tag key={tag} label={tag} />)}
                    </div>
                  )}
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-green-500 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <RoadmapCreator
        open={creatorOpen}
        onClose={() => setCreatorOpen(false)}
        onCreated={(rm) => setRoadmaps((prev) => [rm, ...prev])}
        user={user}
      />
    </div>
  );
};

export default Roadmaps;