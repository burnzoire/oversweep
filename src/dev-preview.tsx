import "@vitejs/plugin-react/preamble";
import { createRoot } from "react-dom/client";
import CaseThreePractice from "./components/CaseThreePractice";

const root = document.getElementById("local-practice-root");

if (root) createRoot(root).render(<CaseThreePractice />);
