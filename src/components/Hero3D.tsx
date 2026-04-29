import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function FloatingBook({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.2}>
      <mesh ref={ref} position={position}>
        <boxGeometry args={[1.2, 1.6, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
    </Float>
  );
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#a8f5e8" />
        <directionalLight position={[-5, -3, 2]} intensity={0.8} color="#d4f87a" />
        <Float speed={1.5} floatIntensity={2}>
          <Sphere args={[1.6, 64, 64]} position={[0, 0, 0]}>
            <MeshDistortMaterial color="#5ee0d0" distort={0.45} speed={2} roughness={0.2} metalness={0.4} />
          </Sphere>
        </Float>
        <FloatingBook position={[-2.8, 1, 0]} color="#a8f5b0" />
        <FloatingBook position={[2.8, -0.5, -0.5]} color="#5ee0d0" />
        <FloatingBook position={[-2.4, -1.5, 0.5]} color="#d4f87a" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}