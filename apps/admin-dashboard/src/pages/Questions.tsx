import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { api } from "../lib/api";

export function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["questions", search, topic],
    queryFn: () => api.get("/v1/questions", { params: { q: search, topic, limit: 50 } }),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-slate-600 mt-1">Manage verified question bank</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} /> Add Question
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input max-w-xs">
            <option value="">All topics</option>
            <option>Constitution</option>
            <option>Geography</option>
            <option>History</option>
            <option>Current Affairs</option>
            <option>English</option>
            <option>Nepali</option>
          </select>
          <button className="btn-ghost">
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-600 uppercase">
              <th className="px-6 py-3">Question</th>
              <th className="px-6 py-3">Topic</th>
              <th className="px-6 py-3">Difficulty</th>
              <th className="px-6 py-3">Verified</th>
              <th className="px-6 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : (
              (data?.data?.questions ?? []).map((q: any) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-sm text-slate-900 line-clamp-2">{q.question_text}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">{q.topic}</td>
                  <td className="px-6 py-4">
                    <DifficultyBadge level={q.difficulty} />
                  </td>
                  <td className="px-6 py-4">
                    {q.verified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">✓ Verified</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{q.source_id ? `Source #${q.source_id.slice(0, 8)}` : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DifficultyBadge({ level }: { level: number }) {
  const colors = ["", "bg-green-100 text-green-700", "bg-blue-100 text-blue-700", "bg-yellow-100 text-yellow-700", "bg-orange-100 text-orange-700", "bg-red-100 text-red-700"];
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[level]}`}>{level}/5</span>;
}
