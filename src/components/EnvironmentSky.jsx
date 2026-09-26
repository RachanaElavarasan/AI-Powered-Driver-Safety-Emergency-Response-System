/**
 * SafePilot AI - Environment, Sky & Atmospheric Lighting
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function EnvironmentSky({ timeOfDay = 'NIGHT', weather = 'CLEAR' }) {
  const isNight = timeOfDay === 'NIGHT';

  // Distant city skyline blocks
  const skylineBuildings = useMemo(() => {
    const buildings = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      const x = -180 + (i * 360) / count;
      const height = 25 + ((i * 13) % 45);
      const width = 8 + ((i * 7) % 12);
      const depth = 8 + ((i * 5) % 10);
      buildings.push({ id: i, x, z: -180, height, width, depth });
    }
    return buildings;
  }, []);

  return (
    <>
      {/* Fog for depth blend */}
      <fog
        attach="fog"
        args={[
          isNight ? (weather === 'RAIN' ? '#030712' : '#090d16') : '#94a3b8',
          35,
          220,
        ]}
      />

      {/* Ambient Light */}
      <ambientLight
        intensity={isNight ? (weather === 'RAIN' ? 0.35 : 0.6) : 1.4}
        color={isNight ? '#64748b' : '#ffffff'}
      />

      {/* Main Directional Light (Moonlight or Daylight) */}
      <directionalLight
        position={[25, 45, -20]}
        intensity={isNight ? 0.8 : 2.2}
        color={isNight ? '#38bdf8' : '#fffbeb'}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={10}
        shadow-camera-far={120}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* Hemispheric ambient bounce */}
      <hemisphereLight
        args={[isNight ? '#0284c7' : '#bae6fd', isNight ? '#020617' : '#334155', 0.5]}
      />

      {/* Distant City Skyline Silhouettes */}
      <group position={[0, 0, 0]}>
        {skylineBuildings.map((b) => (
          <mesh
            key={b.id}
            position={[b.x, b.height / 2 - 2, b.z]}
          >
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshStandardMaterial
              color={isNight ? '#0b1120' : '#475569'}
              roughness={0.9}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
