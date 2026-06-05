import { StrictMode, Component } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AdminApp, AdminLogin } from "@/AdminApp";
import "./index.css";

type AdminErrorBoundaryState = { error: string | null };

class AdminErrorBoundary extends Component<{ children: ReactNode }, AdminErrorBoundaryState> {
  override state: AdminErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): AdminErrorBoundaryState {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  override render() {
    if (this.state.error) {
      return (
        <div style={{ color: "red", padding: "40px", fontFamily: "monospace", background: "#fff", minHeight: "100vh" }}>
          Admin Error: {this.state.error}
        </div>
      );
    }

    return this.props.children;
  }
}

function AdminEntry() {
  return window.location.pathname === "/admin/login" ? <AdminLogin /> : <AdminApp />;
}

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <AdminErrorBoundary>
      <AdminEntry />
    </AdminErrorBoundary>
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}
