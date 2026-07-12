"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";

function GlossyTorus() {
  return (
    <Float speed={1.4} rotationIntensity={1.1} floatIntensity={1.6}>
      <mesh position={[-1.6, 1.1, 0]} rotation={[0.6, 0.4, 0.2]}>
        <torusGeometry args={[1.05, 0.34, 64, 128]} />
        <meshPhysicalMaterial color="#7c3aed" roughness={0.15} metalness={0.35} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
    </Float>
  );
}

function GlossyTube() {
  return (
    <Float speed={1.1} rotationIntensity={0.8} floatIntensity={1.3}>
      <mesh position={[1.6, -1.2, -0.5]} rotation={[0.3, 0.2, 1.1]}>
        <capsuleGeometry args={[0.32, 2.3, 8, 24]} />
        <meshPhysicalMaterial color="#3b82f6" roughness={0.1} metalness={0.4} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
    </Float>
  );
}

function GlossySphereLarge() {
  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.8}>
      <mesh position={[1.9, 1.4, -0.8]}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial color="#60a5fa" roughness={0.05} metalness={0.2} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
    </Float>
  );
}

function GlossySphereSmall() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2.2}>
      <mesh position={[-1.5, -1.5, 0.4]}>
        <sphereGeometry args={[0.32, 48, 48]} />
        <meshPhysicalMaterial color="#f472b6" roughness={0.1} metalness={0.25} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
    </Float>
  );
}

export function Auth3DScene() {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 4, 4]} intensity={1.2} />
        <directionalLight position={[-4, -2, 2]} intensity={0.4} color="#a78bfa" />
        <GlossyTorus />
        <GlossyTube />
        <GlossySphereLarge />
        <GlossySphereSmall />
        <Environment preset="city" />
        <ContactShadows position={[0, -2.4, 0]} opacity={0.25} scale={10} blur={2.5} far={4} />
      </Suspense>
    </Canvas>
  );
}
