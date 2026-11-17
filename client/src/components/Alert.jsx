import { AlertCircle, CheckCircle2, Info } from "lucide-react";

// Shows a coloured message box. type = "error" | "success" | "info"
function Alert({ type = "info", children }) {
  if (!children) return null;

  const styles = {
    error: "border-rose-200 bg-rose-50 text-rose-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
  };
  const Icon = type === "error" ? AlertCircle : type === "success" ? CheckCircle2 : Info;

  return (
    <div className={"flex items-start gap-2 rounded-xl border px-4 py-3 text-sm " + styles[type]}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export default Alert;
