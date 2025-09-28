"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const World = dynamic(() => import("../components/World"), { ssr: false });

export default function Page() {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff4d4f");

  useEffect(() => {
    setName(localStorage.getItem("playerName") || "");
    setColor(localStorage.getItem("playerColor") || "#ff4d4f");
  }, []);

  function join() {
    if (!name) {
      alert("Enter a name");
      return;
    }
    localStorage.setItem("playerName", name);
    localStorage.setItem("playerColor", color);
    setJoined(true);
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      {!joined ? (
        <div className="m-auto w-full max-w-md p-6 bg-white rounded-xl shadow">
          <h1 className="text-2xl font-semibold mb-4">Join Metaverse</h1>
          <label className="block mb-2">
            <div className="text-sm text-slate-600">Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2 rounded mt-1" />
          </label>

          <label className="block mb-4">
            <div className="text-sm text-slate-600">Avatar color</div>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1" />
          </label>

          <div className="flex gap-2">
            <button onClick={join} className="px-4 py-2 bg-blue-600 text-white rounded">Enter World</button>
            <a className="px-4 py-2 border rounded" href="/about">About</a>
          </div>
        </div>
      ) : (
        <World />
      )}
    </div>
  );
}
