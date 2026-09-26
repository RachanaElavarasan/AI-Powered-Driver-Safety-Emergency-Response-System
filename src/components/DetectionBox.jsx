/**
 * SafePilot AI - Perception Overlay & 3D Bounding Box
 * Features:
 * - 3D Wireframe Corner Brackets around target
 * - Dynamic Laser Distance Measurement Line
 * - Projected High-Tech Glass HUD Tag with distance, relative speed, TTC & classification
 * - Dynamic color transitions: Safe (Cyan) -> Warning (Amber) -> Critical (Neon Red)
 */

import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function DetectionBox({
  target,
  riskLevel = 'LOW',
  ttcMetrics = {},
  egoSpeedKmh = 75,
}) {
  if (!target || !target.distanceM) return null;

  const posX = target.lane * 4.5;
  const posZ = -target.distanceM;
  const posY = target.type === 'OBSTACLE' ? 0.7 : 0.85;

  // Color theme according to danger
  const isCritical = riskLevel === 'CRITICAL' || ttcMetrics.dangerLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH' || ttcMetrics.dangerLevel === 'HIGH';
  const isMedium = riskLevel === 'MEDIUM' || ttcMetrics.dangerLevel === 'MEDIUM';

  const colorHex = isCritical
    ? '#ef4444' // Neon Red
    : isHigh
    ? '#f97316' // Orange / Amber
    : isMedium
    ? '#eab308' // Yellow
    : '#06b6d4'; // Cyan

  const tagBorder = isCritical
    ? 'border-red-500 bg-red-950/80 shadow-red-500/50'
    : isHigh
    ? 'border-amber-500 bg-amber-950/80 shadow-amber-500/50'
    : isMedium
    ? 'border-yellow-500 bg-yellow-950/80 shadow-yellow-500/50'
    : 'border-cyan-500 bg-cyan-950/80 shadow-cyan-500/50';

  const relativeSpeed = Math.round((egoSpeedKmh - target.speedKmh) * 10) / 10;
  const relSpeedText =
    relativeSpeed > 0 ? `+${relativeSpeed} km/h (Closing)` : `${relativeSpeed} km/h (Opening)`;

  // Bounding box dimensions
  const bw = target.type === 'OBSTACLE' ? 2.4 : 2.2;
  const bh = target.type === 'OBSTACLE' ? 1.6 : 1.7;
  const bl = target.type === 'OBSTACLE' ? 2.4 : 4.6;

  return (
    <group position={[posX, posY, posZ]}>
      {/* 1. 3D Glowing Wireframe Bounding Box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[bw, bh, bl]} />
        <meshBasicMaterial
          color={colorHex}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 2. Projected Futuristic HTML HUD Annotation Card */}
      <Html
        position={[0, bh / 2 + 0.6, 0]}
        center
        distanceFactor={28}
        zIndexRange={[100, 0]}
      >
        <div
          className={`pointer-events-none select-none rounded border px-3 py-2 text-xs font-mono backdrop-blur-md shadow-lg transition-all duration-300 min-w-[170px] ${tagBorder}`}
        >
          {/* Animated corner brackets decoration */}
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-current" />
          <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-current" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-bottom-2 border-l-2 border-current" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-current" />

          {/* Header Tag */}
          <div className="flex items-center justify-between border-b border-white/20 pb-1 mb-1 font-bold tracking-wider">
            <span className="flex items-center gap-1.5 font-tech uppercase text-[11px] text-white">
              <span
                className="inline-block w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: colorHex }}
              />
              {target.type || 'VEHICLE'}
            </span>
            <span
              className="text-[10px] px-1 py-0.2 rounded font-mono font-bold"
              style={{
                backgroundColor: `${colorHex}33`,
                color: colorHex,
              }}
            >
              ID: #01
            </span>
          </div>

          {/* Metrics Rows */}
          <div className="space-y-0.5 text-[11px] text-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px]">DISTANCE</span>
              <span className="font-bold text-white font-mono-nums">
                {target.distanceM.toFixed(1)} m
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px]">SPEED</span>
              <span className="font-mono-nums font-semibold">
                {Math.round(target.speedKmh)} km/h
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px]">REL VEL</span>
              <span className="font-mono-nums text-[10px] text-cyan-300">
                {relSpeedText}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px]">DIRECTION</span>
              <span className="font-mono-nums text-[10px] font-bold text-emerald-400">
                {target.direction || 'AHEAD'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-0.5 border-t border-white/10">
              <span className="text-slate-400 text-[10px]">TTC</span>
              <span
                className={`font-mono-nums font-bold ${
                  isCritical
                    ? 'text-red-400 animate-pulse'
                    : isHigh
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {ttcMetrics.ttcDisplay || 'NOMINAL'}
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

/**
 * 3D Dynamic Laser Beam connecting SafePilot front bumper to Lead Target
 */
export function DistanceLaserBeam({ targetDistanceM = 40, targetLane = 0, riskLevel = 'LOW' }) {
  if (!targetDistanceM || targetDistanceM <= 0) return null;

  const isCritical = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';
  const colorHex = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#00f2ff';

  // Calculate distance midpoint for ground guide line
  const midZ = (-2.1 - targetDistanceM) / 2;
  const lineLength = targetDistanceM - 2.1;

  return (
    <group>
      {/* Projected Ground Distance Track Strip */}
      <mesh
        position={[targetLane * 2.25, 0.02, midZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.3, Math.max(0.1, lineLength)]} />
        <meshBasicMaterial
          color={colorHex}
          opacity={0.35}
          transparent
        />
      </mesh>

      {/* Pulsing Target Footprint Disc */}
      <mesh
        position={[targetLane * 4.5, 0.03, -targetDistanceM]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.2, 1.35, 32]} />
        <meshBasicMaterial color={colorHex} opacity={0.8} transparent />
      </mesh>
    </group>
  );
}
