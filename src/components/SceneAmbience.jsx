import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colors, starSpectralPalette } from '../styles/designTokens';

const pickColor = (i) => starSpectralPalette[i % starSpectralPalette.length];

/** Large slow-moving nebula volumes */
export const DeepNebulaField = ({ starTextures, count = 18 }) => {
  const groupRef = useRef();
  const clouds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 280,
          (Math.random() - 0.5) * 160,
          -90 - Math.random() * 120,
        ],
        scale: [60 + Math.random() * 90, 25 + Math.random() * 40, 1],
        color: pickColor(i + 1),
        phase: Math.random() * Math.PI * 2,
        drift: 0.04 + Math.random() * 0.08,
        rot: Math.random() * Math.PI,
      })),
    [count]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const c = clouds[i];
      child.position.x = c.position[0] + Math.sin(t * c.drift + c.phase) * 14;
      child.position.y = c.position[1] + Math.cos(t * c.drift * 0.6 + c.phase) * 8;
      child.material.opacity = 0.028 + Math.sin(t * 0.18 + c.phase) * 0.012;
      child.rotation.z = c.rot + t * 0.01;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <sprite key={`nebula-deep-${i}`} position={c.position} scale={c.scale} rotation={[0, 0, c.rot]}>
          <spriteMaterial
            map={starTextures.burst}
            color={c.color}
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
};

/** Faint orbital rings for depth */
export const OrbitalRings = () => {
  const ringsRef = useRef([]);
  const rings = useMemo(
    () =>
      [42, 68, 95, 125].map((r, i) => ({
        radius: r,
        opacity: 0.04 - i * 0.006,
        speed: 0.015 + i * 0.008,
        tilt: 0.15 + i * 0.05,
      })),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.x = rings[i].tilt;
        ring.rotation.z = t * rings[i].speed;
        ring.material.opacity = rings[i].opacity + Math.sin(t * 0.3 + i) * 0.01;
      }
    });
  });

  return (
    <group position={[0, 0, -40]}>
      {rings.map((ring, i) => (
        <mesh
          key={`ring-${i}`}
          ref={(el) => {
            ringsRef.current[i] = el;
          }}
          rotation={[ring.tilt, 0, 0]}
        >
          <ringGeometry args={[ring.radius - 0.15, ring.radius + 0.15, 128]} />
          <meshBasicMaterial
            color={colors.celestialLight}
            transparent
            opacity={ring.opacity}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

/** Vertical light pillars */
export const LightPillars = ({ starTextures }) => {
  const groupRef = useRef();
  const pillars = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        position: [-70 + i * 28, -20 + (i % 3) * 15, -100 - i * 15],
        scale: [4 + Math.random() * 6, 80 + Math.random() * 60, 1],
        phase: Math.random() * Math.PI * 2,
        color: pickColor(i + 4),
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      child.material.opacity = 0.02 + Math.sin(t * 0.25 + pillars[i].phase) * 0.015;
    });
  });

  return (
    <group ref={groupRef}>
      {pillars.map((p, i) => (
        <sprite key={`pillar-${i}`} position={p.position} scale={p.scale}>
          <spriteMaterial
            map={starTextures.cross}
            color={p.color}
            transparent
            opacity={0.025}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
};

/** Dense star clusters in the distance */
export const StarClusters = ({ starTextures, clusterCount = 8 }) => {
  const clusters = useMemo(() => {
    const result = [];
    for (let c = 0; c < clusterCount; c += 1) {
      const center = [
        (Math.random() - 0.5) * 220,
        (Math.random() - 0.5) * 140,
        -70 - Math.random() * 100,
      ];
      const starsInCluster = 12 + Math.floor(Math.random() * 18);
      for (let s = 0; s < starsInCluster; s += 1) {
        result.push({
          position: [
            center[0] + (Math.random() - 0.5) * 25,
            center[1] + (Math.random() - 0.5) * 25,
            center[2] + (Math.random() - 0.5) * 15,
          ],
          size: 0.05 + Math.random() * 0.12,
          color: pickColor(c + s),
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    return result;
  }, [clusterCount]);

  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const s = clusters[i];
      child.material.opacity = 0.35 + Math.sin(t * 0.8 + s.phase) * 0.15;
    });
  });

  return (
    <group ref={groupRef}>
      {clusters.map((s, i) => (
        <sprite key={`cluster-${i}`} position={s.position} scale={[s.size * 5, s.size * 5, 1]}>
          <spriteMaterial
            map={starTextures.pinpoint}
            color={s.color}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
};

/** Second distant galaxy accent */
export const DistantGalaxies = ({ starTextures }) => {
  const galaxies = useMemo(
    () => [
      { position: [95, 35, -160], scale: [70, 28, 1], rot: 0.4, color: '#9b8ae8' },
      { position: [-110, -25, -140], scale: [55, 22, 1], rot: -0.3, color: '#88c8ff' },
      { position: [40, -50, -175], scale: [40, 16, 1], rot: 0.6, color: '#b6d9fc' },
    ],
    []
  );

  return (
    <group>
      {galaxies.map((g, i) => (
        <GalaxySprite key={`galaxy-${i}`} {...g} starTextures={starTextures} index={i} />
      ))}
    </group>
  );
};

const GalaxySprite = ({ position, scale, rot, color, starTextures, index }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = rot + clock.getElapsedTime() * (0.015 + index * 0.005);
      ref.current.material.opacity = 0.05 + Math.sin(clock.getElapsedTime() * 0.2 + index) * 0.015;
    }
  });
  return (
    <sprite ref={ref} position={position} scale={scale}>
      <spriteMaterial
        map={starTextures.burst}
        color={color}
        transparent
        opacity={0.05}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
};
