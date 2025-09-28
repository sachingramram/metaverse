import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

type Player = {
  id: string;
  name: string;
  color: string;
  x: number;
  z: number;
};

export default function Avatar({ player }: { player: Player }) {
  const ref = useRef<any>(null); // ✅ FIX: give initial value

  useFrame((state, delta) => {
    if (!ref.current) return;
    // smooth follow
    ref.current.position.x +=
      (player.x - ref.current.position.x) * Math.min(8 * delta, 1);
    ref.current.position.z +=
      (player.z - ref.current.position.z) * Math.min(8 * delta, 1);
    // bobbing
    ref.current.position.y =
      0.8 +
      Math.sin(state.clock.elapsedTime * 2 + player.x + player.z) * 0.05;
  });

  return (
    <group ref={ref} position={[player.x, 0.8, player.z]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
        <meshStandardMaterial color={player.color} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={player.color} />
      </mesh>
    </group>
  );
}
