// components/World.tsx
"use client";
import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import io from "socket.io-client";
import { create } from "zustand";
import Avatar from "./Avatar";

type Player = {
  id: string;
  name: string;
  color: string;
  x: number;
  z: number;
  lastSeen?: number;
};

type State = {
  meId?: string;
  players: Record<string, Player>;
  setPlayers: (players: Record<string, Player>) => void;
  updatePlayer: (p: Player) => void;
};

const useStore = create<State>((set) => ({
  players: {},
  setPlayers: (players) => set({ players }),
  updatePlayer: (p) => set((s) => ({ players: { ...s.players, [p.id]: p } }))
}));

let socket: any = null;

function ControlsOverlay() {
  const move = (dx: number, dz: number) => {
    if (!socket) return;
    socket.emit("move", { dx, dz });
  };

  return (
    <div className="absolute left-4 bottom-6 z-50">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button onClick={() => move(0, -1)} className="p-2 bg-white rounded shadow">↑</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => move(-1, 0)} className="p-2 bg-white rounded shadow">←</button>
          <button onClick={() => move(1, 0)} className="p-2 bg-white rounded shadow">→</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => move(0, 1)} className="p-2 bg-white rounded shadow">↓</button>
        </div>
      </div>
    </div>
  );
}

function Scene() {
  const players = useStore((s) => s.players);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={"#e6f2ff"} />
      </mesh>

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.7} />

      {Object.values(players).map((p) => (
        <Avatar key={p.id} player={p} />
      ))}
    </>
  );
}

export default function World() {
  const setPlayers = useStore((s) => s.setPlayers);
  const updatePlayer = useStore((s) => s.updatePlayer);

  useEffect(() => {
    const name = localStorage.getItem("playerName") || `Guest-${Math.floor(Math.random() * 1000)}`;
    const color = localStorage.getItem("playerColor") || "#ff4d4f";

    // Connect (use env or default to http://localhost:3001)
    const socketUrl =
      typeof window !== "undefined" && process.env.NEXT_PUBLIC_SOCKET_URL
        ? process.env.NEXT_PUBLIC_SOCKET_URL
        : (typeof window !== "undefined" ? (location.protocol + '//' + location.hostname + ':3001') : "http://localhost:3001");

    socket = io(socketUrl, { transports: ["websocket"] });

    socket.on("connect", () => {
      socket.emit("join", { name, color });
    });

    // full players list
    socket.on("players", (playersObj: Record<string, Player>) => {
      setPlayers(playersObj);
    });

    // a new player joined
    socket.on("playerJoined", (p: Player) => {
      updatePlayer(p);
    });

    // a player moved
    socket.on("playerMoved", (p: Player) => {
      updatePlayer(p);
    });

    // player left -> create a copy of current players and remove the id, then set
    socket.on("playerLeft", (id: string) => {
      const currentPlayers = useStore.getState().players;
      if (!currentPlayers || !currentPlayers[id]) {
        // nothing to do
        return;
      }
      const copy: Record<string, Player> = { ...currentPlayers };
      delete copy[id];
      setPlayers(copy);
    });

    return () => {
      if (socket) socket.disconnect();
      socket = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 10, 15], fov: 55 }}>
        <PerspectiveCamera makeDefault position={[0, 10, 15]} />
        <OrbitControls />
        <Scene />
      </Canvas>

      <div className="absolute top-4 right-4 bg-white/80 p-3 rounded shadow">
        <div className="text-sm font-semibold">Players in world</div>
        <PlayersList />
      </div>

      <ControlsOverlay />
    </div>
  );
}

function PlayersList() {
  const players = useStore((s) => s.players);
  return (
    <div className="mt-2">
      {Object.values(players).map((p) => (
        <div key={p.id} className="flex items-center gap-2 text-sm py-1">
          <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
          <div>{p.name}</div>
        </div>
      ))}
    </div>
  );
}
