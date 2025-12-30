import React from "react";
import Game from "./components/Game";

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>TOP - Where's Waldo</h1>
      </header>
      <main>
        <Game />
      </main>
    </div>
  );
}
