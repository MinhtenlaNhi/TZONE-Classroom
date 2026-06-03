import { Outlet } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import "./StudentShell.css";

export default function StudentShell() {
  return (
    <div className="student-shell" style={{ backgroundColor: "#fafafa" }}>
      <PublicHeader />
      <main className="student-shell__main" style={{ paddingTop: '2rem', minHeight: '80vh' }}>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
