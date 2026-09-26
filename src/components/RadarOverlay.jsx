/**
 * SafePilot AI - Forward Radar Scan Cone & Trajectory Overlay
 * Features:
 * - Projected forward perception cone with animated scanning pulse
 * - Distance concentric range arcs (10m, 25m, 50m)
 * - Safe lane trajectory predictive guide lines that steer dynamically with vehicle
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function RadarOverlay({
  riskLevel = 'LOW',
  egoSpeedKmh = 75,
  vehicleX = 0,
  vehicleRotation = 0,
}) {
  const sweepRef = useRef();

  useFrame(() => {
    if (sweepRef.current) {
      const time = performance.now() * 0.001;
      const t = (time * 1.5) % 1; // 0 to 1 scan wave
      sweepRef.current.scale.set(1 + t * 2.5, 1 + t * 2.5, 1);
      if (sweepRef.current.material) {
        sweepRef.current.material.opacity = Math.max(0, 0.45 * (1 - t));
      }
    }
  });

  const isCritical = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';
  const colorHex = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#06b6d4';

  return (
    <group
      position={[vehicleX, 0.015, -2.2]}
      rotation={[0, -vehicleRotation, 0]}
    >
      {/* 1. Concentric Distance Arcs */}
      {/* 15 Meter Range Arc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -12]}>
        <ringGeometry args={[11.8, 12.0, 32, 1, Math.PI * 0.25, Math.PI * 0.5]} />
        <meshBasicMaterial color={colorHex} opacity={0.35} transparent />
      </mesh>

      {/* 30 Meter Range Arc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]}>
        <ringGeometry args={[24.8, 25.0, 32, 1, Math.PI * 0.3, Math.PI * 0.4]} />
        <meshBasicMaterial color={colorHex} opacity={0.25} transparent />
      </mesh>

      {/* 50 Meter Range Arc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -45]}>
        <ringGeometry args={[44.8, 45.0, 32, 1, Math.PI * 0.32, Math.PI * 0.36]} />
        <meshBasicMaterial color={colorHex} opacity={0.18} transparent />
      </mesh>

      {/* 2. Pulsing Radar Wave */}
      <mesh
        ref={sweepRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -10]}
      >
        <ringGeometry args={[4.0, 4.3, 32, 1, Math.PI * 0.25, Math.PI * 0.5]} />
        <meshBasicMaterial color={colorHex} opacity={0.4} transparent />
      </mesh>

      {/* 3. SafePilot Ego Path Predictive Trajectory Lines (Cyan Carpet) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.95, 0, -18]}>
        <planeGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#00f2ff" opacity={0.5} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.95, 0, -18]}>
        <planeGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#00f2ff" opacity={0.5} transparent />
      </mesh>
    </group>
  );
}
