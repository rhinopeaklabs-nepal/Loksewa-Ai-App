import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, Brain, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../lib/api";

export function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/v1/admin/analytics/dashboard"),
  });

  const dauData = [
    { day: "Mon", dau: 1240 }, { day: "Tue", dau: 1390 }, { day: "Wed", dau: 1680 },
    { day: "Thu", dau: 1810 }, { day: "Fri", dau: 2100 }, { day: "Sat", dau: 2450 },
    { day: "Sun", dau: 2200 },
  ];

  const topicData = [
    { topic: "Constitution", score: 72 },
    { topic: "Geography", score: 58 },
    { topic: "History", score: 64 },
    { topic: "Current Affairs", score: 51 },
    { topic: "English", score: 81 },
    { topic: "Nepali", score: 76 },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600 mt-1">Real-time overview of the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="text-blue-600" size={24} />}
          label="Daily Active Users"
          value="2,450"
          delta="+12.3%"
        />
        <StatCard
          icon={<BookOpen className="text-green-600" size={24} />}
          label="Questions Answered"
          value="48,210"
          delta="+8.1%"
        />
        <StatCard
          icon={<Brain className="text-purple-600" size={24} />}
          label="AI Tutor Messages"
          value="12,840"
          delta="+24.5%"
        />
        <StatCard
          icon={<Activity className="text-orange-600" size={24} />}
          label="Mock Exams Taken"
          value="892"
          delta="+15.2%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Daily Active Users</h2>
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dauData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="dau" stroke="#1F8852" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Average Score by Topic</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="topic" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#F37B14" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta: string }) {
  const positive = delta.startsWith("+");
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-slate-50">{icon}</div>
        <span className={`text-xs font-medium ${positive ? "text-green-600" : "text-red-600"}`}>{delta}</span>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-slate-600 mt-1">{label}</p>
      </div>
    </div>
  );
}
