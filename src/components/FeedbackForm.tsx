import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";

const CATEGORIES = [
  "service",
  "corruption",
  "accessibility",
  "suggestion",
  "complaint",
  "other",
] as const;

interface FeedbackFormProps {
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export function FeedbackForm({ relatedEntityType, relatedEntityId }: FeedbackFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<string>("suggestion");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitFeedback = useMutation(api.feedback.submit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback({
      name: name || "Anonymous",
      email: email || undefined,
      category,
      message,
      relatedEntityType,
      relatedEntityId,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-surface rounded-2xl p-4 text-center"
      >
        <MessageSquare size={24} className="mx-auto mb-2 text-green-400" />
        <p className="font-semibold text-sm">Thank you for your feedback!</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your input helps us improve SaloneHub.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn-ghost text-sm flex items-center gap-2"
      >
        <MessageSquare size={16} />
        {open ? "Cancel" : "Report issue / Give feedback"}
      </button>

      {open && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="mt-3 space-y-3 glass-surface rounded-2xl p-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input text-sm"
              required
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input text-sm"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Tell us about your experience..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input text-sm min-h-[80px]"
            required
          />
          <button type="submit" className="btn-primary text-sm flex items-center gap-2">
            <Send size={14} />
            Submit
          </button>
        </motion.form>
      )}
    </div>
  );
}
