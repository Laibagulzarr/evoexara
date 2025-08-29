import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./index.css"; // make sure Tailwind is applied

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="flex gap-8 mb-8">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="w-24 h-24" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="w-24 h-24" alt="React logo" />
        </a>
      </div>

      <h1 className="text-5xl font-bold text-blue-400 mb-6">
        🚀 Vite + React + Tailwind
      </h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-2 rounded bg-blue-500 hover:bg-blue-600 transition"
        >
          count is {count}
        </button>
        <p className="mt-4 text-gray-300">
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </div>
  );
}

export default App;
