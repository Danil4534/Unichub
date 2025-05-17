import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Router from "./Router";
import { useEffect } from "react";
import { useStore } from "./store/store";

function App() {
  const store = useStore();
  useEffect(() => {
    const root = document.documentElement;
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    store.setCurrentUser();
  }, [store.theme]);
  return (
    <>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </>
  );
}

export default App;
