import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const color =
    type === "success" ? "alert-success" :
    type === "error" ? "alert-error" :
    "alert-info";

  return (
    <div className="toast toast-end">
      <div className={`alert ${color} shadow-lg`}>
        <span>{message}</span>
      </div>
    </div>
  );
}
