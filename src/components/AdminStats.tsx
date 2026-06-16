import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Users, FileText, UserCheck, MessageSquare, Activity } from "lucide-react";

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-surface rounded-xl p-4 flex items-center gap-4"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

export function AdminStats() {
  const stats = useQuery(api.stats.getDashboardStats);

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-[30vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText size={20} className="text-emerald-400" />}
          label="Services"
          value={stats.totalServices}
          color="bg-emerald-500/20"
        />
        <StatCard
          icon={<UserCheck size={20} className="text-blue-400" />}
          label="Representatives"
          value={stats.totalRepresentatives}
          color="bg-blue-500/20"
        />
        <StatCard
          icon={<Users size={20} className="text-purple-400" />}
          label="Users"
          value={stats.totalUsers}
          color="bg-purple-500/20"
        />
        <StatCard
          icon={<MessageSquare size={20} className="text-yellow-400" />}
          label="Open Feedback"
          value={stats.openFeedbackCount}
          color="bg-yellow-500/20"
        />
      </div>

      <div className="glass-surface rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Activity size={16} className="text-muted-foreground" />
          Recent Activity
        </h3>
        {stats.recentLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <div className="space-y-2">
            {stats.recentLogs.map((log) => (
              <div key={log._id} className="flex items-center gap-2 text-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${log.action === "create" ? "bg-green-400" : log.action === "update" ? "bg-blue-400" : "bg-red-400"}`} />
                <span className="capitalize font-medium text-xs">{log.action}</span>
                <span className="text-muted-foreground text-xs">{log.entityType}</span>
                {log.details && <span className="text-muted-foreground text-xs truncate max-w-[150px]">— {log.details}</span>}
                <span className="text-xs text-muted-foreground ml-auto">{new Date(log.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
