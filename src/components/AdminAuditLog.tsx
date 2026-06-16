import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Clock, User, Activity } from "lucide-react";

export function AdminAuditLog() {
  const logs = useQuery(api.adminLogs.list);

  if (!logs) {
    return (
      <div className="flex justify-center items-center min-h-[30vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Activity size={40} className="mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-lg font-bold mb-1">No audit logs yet</h3>
        <p className="text-sm text-muted-foreground">
          Admin actions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {logs.map((log, i) => (
        <motion.div
          key={log._id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.02 }}
          className="glass-surface rounded-xl p-3 flex items-start gap-3 text-sm"
        >
          <div className="flex-shrink-0 mt-0.5">
            <div
              className={`w-2 h-2 rounded-full ${
                log.action === "create"
                  ? "bg-green-400"
                  : log.action === "update"
                    ? "bg-blue-400"
                    : "bg-red-400"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-semibold capitalize ${
                  log.action === "create"
                    ? "text-green-400"
                    : log.action === "update"
                      ? "text-blue-400"
                      : "text-red-400"
                }`}
              >
                {log.action}
              </span>
              <span className="text-muted-foreground">{log.entityType}</span>
              {log.details && (
                <span className="text-muted-foreground truncate max-w-[200px]">
                  — {log.details}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(log.timestamp).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <User size={12} />
                {log.adminId.slice(0, 8)}…
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
