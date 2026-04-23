import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import CornellQuiz from "./CornellQuiz";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CornellQuiz />
    <Analytics />
  </React.StrictMode>
);
