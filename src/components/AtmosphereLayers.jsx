import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colors, starSpectralPalette } from '../styles/designTokens';

const spectralPalette = starSpectralPalette;

const pickColor = (i) => spectralPalette[i % spectralPalette.length];

/** Slow aurora ribbons deep in the scene */
export const AuroraRibbons = ({ starTextures }) => {
  const groupRef = useRef();
  const ribbons = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        position: [(i - 1.5) * 55, 15 - i * 8, -140 - i * 25],
        scale: [120 + i * 20, 35 + i * 10, 1],
        color: pickColor(i + 2),
        phase: Math.random() * Math.PI * 2,
        speed: 0.06 + i * 0.02,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const ribbon = ribbons[i];
      child.position.x = ribbon.position[0] + Math.sin(t * ribbon.speed + ribbon.phase) * 12;
      child.position.y = ribbon.position[1] + Math.cos(t * ribbon.speed * 0.7 + ribbon.phase) * 6;
      child.material.opacity = 0.035 + Math.sin(t * 0.3 + ribbon.phase) * 0.02;
      child.rotation.z = Math.sin(t * 0.15 + ribbon.phase) * 0.08;
    });
  });

  return (
    <group ref={groupRef}>
      {ribbons.map((ribbon, i) => (
        <sprite key={`aurora-${i}`} position={ribbon.position} scale={ribbon.scale}>
          <spriteMaterial
            map={starTextures.sparkle}
            color={ribbon.color}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
};

/** Faint constellation lines between nearby background points */
export const ConstellationWeb = () => {
  const linesRef = useRef();
  const geometry = useMemo(() => {
    const points = Array.from({ length: 24 }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 120,
      z: -80 - Math.random() * 60,
    }));

    const segments = [];
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 45) {
          segments.push(
            points[i].x, points[i].y, points[i].z,
            points[j].x, points[j].y, points[j].z
          );
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (linesRef.current) {
      linesRef.current.material.opacity = 0.06 + Math.sin(clock.getElapsedTime() * 0.4) * 0.03;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#8aa8e8" transparent opacity={0.07} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
};

/** Distant spiral galaxy smudge */
export const DistantGalaxy = ({ starTextures }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.02;
      ref.current.material.opacity = 0.055 + Math.sin(clock.getElapsedTime() * 0.25) * 0.015;
    }
  });

  return (
    <sprite ref={ref} position={[95, 35, -160]} scale={[70, 28, 1]} rotation={[0, 0, 0.4]}>
      <spriteMaterial
        map={starTextures.burst}
        color="#9b8ae8"
        transparent
        opacity={0.06}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
};

/** Fine drifting dust particles */
export const CosmicDust = ({ count = 80, starTextures }) => {
  const groupRef = useRef();
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 250,
          (Math.random() - 0.5) * 250,
          (Math.random() - 0.5) * 180 - 30,
        ],
        speed: 0.3 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        size: 0.04 + Math.random() * 0.08,
        color: pickColor(i),
      })),
    [count]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      child.position.x = p.position[0] + Math.sin(t * p.speed + p.phase) * 4;
      child.position.y = p.position[1] + Math.cos(t * p.speed * 0.6 + p.phase) * 3;
      child.material.opacity = 0.15 + Math.sin(t * 1.2 + p.phase) * 0.1;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <sprite key={`dust-${i}`} position={p.position} scale={[p.size * 8, p.size * 8, 1]}>
          <spriteMaterial
            map={starTextures.pinpoint}
            color={p.color}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
};

/** Gentle automatic camera sway */
export const CameraDrift = () => {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.08) * 3;
    camera.position.y = Math.cos(t * 0.06) * 2;
    camera.lookAt(0, 0, 0);
  });
  return null;
};
