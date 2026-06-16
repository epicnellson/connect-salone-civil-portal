import { motion } from "framer-motion";
import { Check, ArrowDown } from "lucide-react";

interface Step {
  label: string;
  description?: string;
}

interface JourneyMapProps {
  steps: Step[];
  title?: string;
}

export function JourneyMap({ steps, title }: JourneyMapProps) {
  if (steps.length === 0) return null;
  return (
    <div className="glass-surface rounded-2xl p-4">
      {title && (
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Check size={16} className="text-emerald-400" />
          {title}
        </h4>
      )}
      <div className="space-y-0">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center gap-0">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-emerald-400">{i + 1}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 min-h-[24px] bg-emerald-500/20" />
              )}
            </div>
            <div className="pb-5 pt-0.5">
              <p className="text-sm font-medium">{step.label}</p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
