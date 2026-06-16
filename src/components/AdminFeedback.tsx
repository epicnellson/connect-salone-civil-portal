import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";

export function AdminFeedback() {
  const feedbackList = useQuery(api.feedback.list);
  const updateStatus = useMutation(api.feedback.updateStatus);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!feedbackList) {
    return (
      <div className="flex justify-center items-center min-h-[30vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <MessageSquare size={40} className="mx-auto mb-3" />
        <p className="font-semibold">No feedback yet</p>
        <p className="text-sm">User submissions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {feedbackList.map((item, i) => (
        <motion.div
          key={item._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="glass-surface rounded-xl p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="pill bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs capitalize">
                  {item.category}
                </span>
                <span
                  className={`pill text-xs capitalize ${
                    item.status === "open"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-green-500/20 text-green-400 border-green-500/30"
                  }`}
                >
                  {item.status === "open" ? (
                    <Clock size={12} className="inline mr-1" />
                  ) : (
                    <CheckCircle size={12} className="inline mr-1" />
                  )}
                  {item.status}
                </span>
              </div>
              <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                {item.message}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{item.name}</span>
                {item.email && <span>· {item.email}</span>}
                <span>· {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {item.status === "open" && (
              <button
                type="button"
                onClick={() => updateStatus({ id: item._id, status: "resolved" })}
                className="btn-ghost text-xs flex items-center gap-1 flex-shrink-0"
                title="Mark as resolved"
              >
                <CheckCircle size={14} />
                Resolve
              </button>
            )}
          </div>
          {item.relatedEntityType && (
            <p className="text-xs text-muted-foreground mt-2">
              Related to: {item.relatedEntityType}
              {item.relatedEntityId && ` (${item.relatedEntityId.slice(0, 8)}…)`}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
