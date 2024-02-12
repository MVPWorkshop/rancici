import ReactDOM from "react-dom/client";

import App from "./App.tsx";

import "./style/index.css";

const init = async () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("React root not found");
  const root = ReactDOM.createRoot(rootElement as HTMLElement);

  root.render(<App />);
};

init();
