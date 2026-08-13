import { AlertCircle, CheckCircle2 } from "lucide-react";

export function FormErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function FormSuccessBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function FieldSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-emerald-600">{message}</p>;
}
