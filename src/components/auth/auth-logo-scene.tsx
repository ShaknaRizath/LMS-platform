"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

// The CIMS seal as a 3D coin that spins continuously around its own vertical axis (through the
// cylinder's center, so the seal never appears to drift off-center). Both faces use the same
// unlit texture (meshBasicMaterial, not affected by scene lighting) so the artwork's colors and
// star/text positions always match the source PNG exactly, at 0° and every full rotation —
// directional lighting on a lit material would shade the print unevenly and make it look shifted.
function SpinningLogo() {
  const groupRef = useRef<Group>(null);
  const texture = useTexture("/cims-logo.png", (loaded) => {
    loaded.colorSpace = THREE.SRGBColorSpace;
    // CylinderGeometry's cap UVs run 90° off from the source artwork's orientation (the seal's
    // single star lands at 9 o'clock instead of 6 o'clock) — counter-rotate the texture itself
    // to align it, rather than the geometry, so the coin's front still faces the camera dead-on.
    loaded.center.set(0.5, 0.5);
    loaded.rotation = Math.PI / 2;
  });

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.22, 96]} />
        <meshPhysicalMaterial attach="material-0" color="#1e2a78" roughness={0.3} metalness={0.6} clearcoat={0.8} />
        <meshBasicMaterial attach="material-1" map={texture} />
        <meshBasicMaterial attach="material-2" map={texture} />
      </mesh>
    </group>
  );
}

export function AuthLogoScene() {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 4, 4]} intensity={1.3} />
        <directionalLight position={[-4, -2, 2]} intensity={0.4} color="#a78bfa" />
        <SpinningLogo />
        <Environment preset="city" />
        <ContactShadows position={[0, -1.7, 0]} opacity={0.25} scale={6} blur={2.5} far={3} />
      </Suspense>
    </Canvas>
  );
}
