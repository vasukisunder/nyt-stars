import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useNews } from '../hooks/useNews';
import { getSectionColor } from '../utils/articleUtils';
import {
  AuroraRibbons,
  ConstellationWeb,
  CosmicDust,
} from './AtmosphereLayers';
import {
  DeepNebulaField,
  DistantGalaxies,
  LightPillars,
  OrbitalRings,
  StarClusters,
} from './SceneAmbience';
import { colors, fonts, radius, shadows, surfaces, starSpectralPalette } from '../styles/designTokens';
import * as THREE from 'three';
import styled from 'styled-components';

const SceneVignette = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  background:
    radial-gradient(ellipse at center, transparent 38%, rgba(5, 6, 15, 0.65) 100%),
    linear-gradient(180deg, rgba(5, 6, 15, 0.4) 0%, transparent 20%, transparent 80%, rgba(5, 6, 15, 0.45) 100%);
`;

const HorizonGlow = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35%;
  pointer-events: none;
  z-index: 49;
  background: linear-gradient(to top, rgba(152, 192, 239, 0.08), transparent);
`;

const STAR_SHAPE_VARIANTS = ['sparkle', 'cross', 'diamond', 'pinpoint', 'burst'];

const spectralPalette = starSpectralPalette;

const hashString = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const pickFromPalette = (seed, palette = spectralPalette) => palette[seed % palette.length];

const getDistinctStarColor = (sectionColor, seed = 0) => {
  const accent = new THREE.Color(pickFromPalette(seed, spectralPalette));
  const base = new THREE.Color(sectionColor);
  const mixed = base.clone().lerp(accent, 0.28);
  mixed.offsetHSL(((seed % 11) - 5) * 0.018, 0.22, ((seed % 7) - 3) * 0.035);
  return mixed;
};

const createStarTexture = (variant = 'sparkle') => {
  if (typeof document === 'undefined') return null;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const center = size / 2;

  const drawSpike = (angle, length, width, opacity) => {
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);
    const spikeGradient = ctx.createLinearGradient(0, 0, 0, -length);
    spikeGradient.addColorStop(0, `rgba(210, 228, 255, ${opacity})`);
    spikeGradient.addColorStop(0.7, `rgba(150, 188, 255, ${opacity * 0.5})`);
    spikeGradient.addColorStop(1, 'rgba(150, 188, 255, 0)');
    ctx.fillStyle = spikeGradient;
    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    ctx.lineTo(0, -length);
    ctx.lineTo(width / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawCore = (radius = 12) => {
    const coreGlow = ctx.createRadialGradient(center, center, 0, center, center, radius);
    coreGlow.addColorStop(0, 'rgba(220, 236, 255, 0.95)');
    coreGlow.addColorStop(0.45, 'rgba(170, 205, 255, 0.55)');
    coreGlow.addColorStop(1, 'rgba(170, 205, 255, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  if (variant === 'cross') {
    drawSpike(0, 128, 9, 1);
    drawSpike(Math.PI / 2, 128, 9, 1);
    drawSpike(Math.PI, 128, 9, 1);
    drawSpike((3 * Math.PI) / 2, 128, 9, 1);
    drawCore(10);
  } else if (variant === 'diamond') {
    drawSpike(Math.PI / 4, 96, 8, 0.95);
    drawSpike((3 * Math.PI) / 4, 96, 8, 0.95);
    drawSpike((5 * Math.PI) / 4, 96, 8, 0.95);
    drawSpike((7 * Math.PI) / 4, 96, 8, 0.95);
    drawCore(14);
  } else if (variant === 'pinpoint') {
    drawSpike(0, 52, 5, 0.85);
    drawSpike(Math.PI / 2, 52, 5, 0.85);
    drawSpike(Math.PI, 52, 5, 0.85);
    drawSpike((3 * Math.PI) / 2, 52, 5, 0.85);
    drawCore(8);
  } else if (variant === 'burst') {
    for (let i = 0; i < 12; i += 1) {
      const angle = (i * Math.PI) / 6;
      const length = i % 2 === 0 ? 88 : 58;
      const width = i % 2 === 0 ? 7 : 5;
      drawSpike(angle, length, width, i % 2 === 0 ? 0.9 : 0.65);
    }
    drawCore(11);
  } else {
    drawSpike(0, 118, 10, 0.98);
    drawSpike(Math.PI / 2, 118, 10, 0.98);
    drawSpike(Math.PI, 118, 10, 0.98);
    drawSpike((3 * Math.PI) / 2, 118, 10, 0.98);
    drawSpike(Math.PI / 4, 74, 8, 0.82);
    drawSpike((3 * Math.PI) / 4, 74, 8, 0.82);
    drawSpike((5 * Math.PI) / 4, 74, 8, 0.82);
    drawSpike((7 * Math.PI) / 4, 74, 8, 0.82);
    drawCore(14);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const createCometTexture = () => {
  if (typeof document === 'undefined') return null;

  const width = 512;
  const height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, height / 2, width, height / 2);
  gradient.addColorStop(0, 'rgba(180, 210, 255, 0)');
  gradient.addColorStop(0.35, 'rgba(200, 225, 255, 0.35)');
  gradient.addColorStop(0.75, 'rgba(230, 242, 255, 0.85)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height / 2 - 2, width, 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const useStarTextures = () => useMemo(() => {
  const textures = {};
  STAR_SHAPE_VARIANTS.forEach((variant) => {
    textures[variant] = createStarTexture(variant);
  });
  textures.comet = createCometTexture();
  return textures;
}, []);

const R = '0';

const panel = `
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid ${surfaces.glassBorder};
  border-radius: ${R};
  backdrop-filter: blur(10px);
`;

const editorialBtn = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 11px 18px;
  font-family: ${fonts.body};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  color: ${colors.arcticMist};
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid ${surfaces.glassBorder};
  border-radius: ${R};
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: ${colors.comet};
    border-color: rgba(186, 215, 247, 0.28);
  }
`;

const ErrorContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  ${panel}
  color: ${colors.comet};
  padding: 24px;
  max-width: 80%;
  text-align: center;
  z-index: 100;
  font-family: ${fonts.body};
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  ${panel}
  color: ${colors.comet};
  padding: 24px;
  max-width: 80%;
  text-align: center;
  z-index: 100;
  font-family: ${fonts.body};
`;

/* Top HUD: title + horizontal section filters */
const HudBar = styled.header`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  pointer-events: none;
  font-family: ${fonts.body};
`;

const HudBrand = styled.div`
  ${panel}
  flex-shrink: 0;
  padding: 14px 18px;
  pointer-events: auto;
`;

const HudTitle = styled.h1`
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: ${colors.ghostWhite};
`;

const HudMeta = styled.p`
  margin: 0;
  font-family: ${fonts.mono};
  font-size: 11px;
  color: ${colors.interstellarGray};
`;

const SectionFilterRow = styled.div`
  ${panel}
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  overflow-x: auto;
  pointer-events: auto;

  &::-webkit-scrollbar {
    height: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${surfaces.glassBorder};
  }
`;

const SectionFilterButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 6px 12px;
  background: ${(props) => (props.$active ? 'rgba(186, 215, 247, 0.1)' : 'transparent')};
  border: 1px solid ${(props) => (props.$active ? 'rgba(186, 215, 247, 0.22)' : 'transparent')};
  border-radius: ${R};
  cursor: pointer;
  font-size: 12px;
  font-family: ${fonts.body};
  letter-spacing: -0.01em;
  text-transform: capitalize;
  color: ${(props) => (props.$active ? colors.comet : colors.azureGlow)};

  &:hover {
    color: ${colors.comet};
    border-color: rgba(186, 215, 247, 0.14);
  }
`;

const ColorIndicator = styled.span`
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  background: ${(props) => props.$color || colors.whisperBlue};
  border-radius: ${R};
`;

/* Bottom hover caption */
const HoverCaption = styled.div`
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%) translateY(${(props) => (props.$visible ? 0 : 10)}px);
  z-index: 100;
  width: min(640px, calc(100% - 40px));
  ${panel}
  padding: 14px 20px;
  font-family: ${fonts.body};
  pointer-events: none;
  text-align: center;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity 0.2s ease, transform 0.2s ease;
`;

const HoverSection = styled.span`
  display: block;
  font-size: 11px;
  color: ${colors.whisperBlue};
  margin-bottom: 6px;
  letter-spacing: -0.01em;
`;

const HoverTitle = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.45;
  color: ${colors.comet};
  letter-spacing: -0.02em;
`;

/* Centered article card */
const ArticleOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 6, 15, 0.6);
  z-index: 1000;
  pointer-events: auto;
`;

const ArticleCard = styled.article`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  width: min(520px, calc(100vw - 40px));
  max-height: min(72vh, 640px);
  ${panel}
  display: flex;
  flex-direction: column;
  font-family: ${fonts.body};
  pointer-events: auto;
`;

const CardHeader = styled.header`
  padding: 20px 22px 14px;
  border-bottom: 1px solid ${surfaces.glassBorder};
  flex-shrink: 0;
`;

const CardClose = styled.button`
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  color: ${colors.whisperBlue};
  font-size: 12px;
  font-family: ${fonts.body};
  letter-spacing: -0.01em;
  cursor: pointer;
  padding: 4px 8px;

  &:hover {
    color: ${colors.comet};
  }
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 10px;
  padding-right: 48px;
`;

const CardSection = styled.span`
  font-size: 11px;
  color: ${colors.whisperBlue};
  letter-spacing: -0.01em;
`;

const CardDate = styled.span`
  font-family: ${fonts.mono};
  font-size: 11px;
  color: ${colors.interstellarGray};
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.35;
  color: ${colors.ghostWhite};
  letter-spacing: -0.02em;
`;

const CardBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px 22px;
`;

const CardAbstract = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.65;
  color: ${colors.comet};
  letter-spacing: -0.01em;
`;

const CardByline = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${colors.azureGlow};
`;

const CardActions = styled.footer`
  display: flex;
  gap: 10px;
  padding: 14px 22px 20px;
  border-top: 1px solid ${surfaces.glassBorder};
  flex-shrink: 0;

  a, button {
    flex: 1;
    ${editorialBtn}
    min-width: 0;
    text-transform: none;
    letter-spacing: -0.01em;
    font-size: 13px;
  }
`;

const Toast = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 101;
  ${panel}
  padding: 10px 14px;
  font-size: 12px;
  letter-spacing: -0.01em;
  color: ${colors.arcticMist};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transform: translateY(${(props) => (props.$visible ? 0 : -6)}px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
`;

// Background Star component (non-interactive)
const BackgroundStar = ({ position, size, color, phase, shape, starTextures }) => {
  const spriteRef = useRef();
  const texture = starTextures[shape] || starTextures.sparkle;
  
  useFrame(({ clock }) => {
    if (spriteRef.current) {
      const time = clock.getElapsedTime();
      const pulse = 0.32 + Math.sin(time * 0.35 + phase) * 0.16;
      const scalePulse = 1 + Math.sin(time * 0.55 + phase) * 0.1;
      const scaleBase = shape === 'pinpoint' ? 3.2 : shape === 'burst' ? 4.8 : 4;
      spriteRef.current.material.opacity = pulse;
      spriteRef.current.scale.set(size * scaleBase * scalePulse, size * scaleBase * scalePulse, 1);
    }
  });
  
  return (
    <sprite position={position} scale={[size * 4, size * 4, 1]} ref={spriteRef}>
      <spriteMaterial
        map={texture}
        color={color}
        transparent
        opacity={0.42}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
};

// Generate static background stars
const BackgroundStars = ({ count = 500, starTextures }) => {
  const stars = useMemo(() => {
    const tempStars = [];
    for (let i = 0; i < count; i++) {
      const position = [
        (Math.random() - 0.5) * 320,
        (Math.random() - 0.5) * 320,
        (Math.random() - 0.5) * 320 - 60
      ];
      const size = Math.random() * 0.14 + 0.05;
      const seed = i * 17 + Math.floor(position[0] * 100);
      tempStars.push({
        position,
        size,
        color: pickFromPalette(seed, spectralPalette),
        phase: Math.random() * Math.PI * 2,
        shape: STAR_SHAPE_VARIANTS[seed % STAR_SHAPE_VARIANTS.length],
      });
    }
    return tempStars;
  }, [count]);
  
  return (
    <group>
      {stars.map((star, i) => (
        <BackgroundStar 
          key={`bg-star-${i}`}
          position={star.position}
          size={star.size}
          color={star.color}
          phase={star.phase}
          shape={star.shape}
          starTextures={starTextures}
        />
      ))}
    </group>
  );
};

const NebulaMist = ({ starTextures }) => {
  const groupRef = useRef();
  const wisps = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 220,
        (Math.random() - 0.5) * 120,
        -120 - i * 18,
      ],
      scale: 55 + Math.random() * 40,
      color: pickFromPalette(i + 3, spectralPalette),
      phase: Math.random() * Math.PI * 2,
      drift: 0.08 + Math.random() * 0.12,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const wisp = wisps[i];
      child.position.x = wisp.position[0] + Math.sin(t * wisp.drift + wisp.phase) * 8;
      child.position.y = wisp.position[1] + Math.cos(t * wisp.drift * 0.8 + wisp.phase) * 5;
      child.material.opacity = 0.04 + Math.sin(t * 0.2 + wisp.phase) * 0.015;
    });
  });

  return (
    <group ref={groupRef}>
      {wisps.map((wisp, i) => (
        <sprite key={`nebula-${i}`} position={wisp.position} scale={[wisp.scale, wisp.scale * 0.55, 1]}>
          <spriteMaterial
            map={starTextures.sparkle}
            color={wisp.color}
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
};

const Meteor = ({ cometTexture, config, onComplete }) => {
  const spriteRef = useRef();
  const state = useRef({
    position: new THREE.Vector3(...config.position),
    velocity: new THREE.Vector3(...config.velocity),
    life: 0,
    maxLife: config.maxLife,
    color: config.color,
    scale: config.scale,
  });

  useFrame((_, delta) => {
    const meteor = state.current;
    meteor.life += delta;
    meteor.position.addScaledVector(meteor.velocity, delta);

    const fade = 1 - meteor.life / meteor.maxLife;
    if (fade <= 0) {
      onComplete(config.id);
      return;
    }

    if (spriteRef.current) {
      spriteRef.current.position.copy(meteor.position);
      spriteRef.current.material.opacity = fade * 0.9;
      spriteRef.current.material.color.set(meteor.color);
      const tail = meteor.scale * (0.7 + fade * 0.5);
      spriteRef.current.scale.set(tail * 3, tail * 0.32, 1);
      spriteRef.current.material.rotation = Math.atan2(meteor.velocity.y, meteor.velocity.x);
    }
  });

  return (
    <sprite ref={spriteRef} position={config.position}>
      <spriteMaterial
        map={cometTexture}
        color={config.color}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
};

const ShootingStars = ({ starTextures }) => {
  const [meteors, setMeteors] = useState([]);
  const spawnTimer = useRef(0);
  const nextSpawn = useRef(2.5 + Math.random() * 3);

  const removeMeteor = useCallback((id) => {
    setMeteors((prev) => prev.filter((m) => m.id !== id));
  }, []);

  useFrame((_, delta) => {
    spawnTimer.current += delta;
    if (spawnTimer.current < nextSpawn.current) return;

    spawnTimer.current = 0;
    nextSpawn.current = 0.9 + Math.random() * 2.2;

    const angle = -0.6 - Math.random() * 0.8;
    const speed = 70 + Math.random() * 50;
    setMeteors((prev) => [
      ...prev.slice(-5),
      {
        id: `${Date.now()}-${Math.random()}`,
        position: [
          -90 - Math.random() * 80,
          35 + Math.random() * 70,
          -30 - Math.random() * 90,
        ],
        velocity: [Math.cos(angle) * speed, Math.sin(angle) * speed, 0],
        maxLife: 0.9 + Math.random() * 0.8,
        color: pickFromPalette(Math.floor(Math.random() * spectralPalette.length), spectralPalette),
        scale: 7 + Math.random() * 8,
      },
    ]);
  });

  return (
    <group>
      {meteors.map((meteor) => (
        <Meteor
          key={meteor.id}
          config={meteor}
          cometTexture={starTextures.comet}
          onComplete={removeMeteor}
        />
      ))}
    </group>
  );
};

// Article Star component (interactive)
const ArticleStar = ({ article, index, onSelectArticle, onHoverArticle, isNew, starTextures }) => {
  const articleSeed = useMemo(
    () => hashString(article.uri || article.url || article.id || article.title || `${index}`),
    [article, index]
  );
  const shape = STAR_SHAPE_VARIANTS[articleSeed % STAR_SHAPE_VARIANTS.length];
  const starTexture = starTextures[shape] || starTextures.sparkle;

  const starRef = useRef();
  const accentRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const sectionColor = getSectionColor(article.section);
  const animationProgress = useRef(0);
  const sizeRef = useRef(0.22 + (articleSeed % 100) / 500);
  const twinkleOffset = useRef((articleSeed % 360) * (Math.PI / 180));
  const starColor = useMemo(
    () => getDistinctStarColor(sectionColor, articleSeed),
    [sectionColor, articleSeed]
  );
  const haloColor = useMemo(() => {
    return starColor.clone().lerp(new THREE.Color(colors.celestialLight), 0.3);
  }, [starColor]);
  
  // Position - stored in a ref to avoid recalculation
  const positionRef = useRef();
  
  // Calculate position only once and store it
  useEffect(() => {
    // Position articles in a distributed pattern
    positionRef.current = [
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 100
    ];
  }, []);
  
  // Size - make the stars more visible
  const size = sizeRef.current;
  // Larger invisible hitbox for better clickability
  const hitboxSize = 3;
  
  // Simple twinkling effect
  useFrame(({ clock }) => {
    if (!starRef.current) return;

    const time = clock.getElapsedTime();
    const pulse = 0.78 + Math.sin(time * 1.2 + twinkleOffset.current) * 0.18;
    const scaleBase = shape === 'pinpoint' ? 4.1 : shape === 'cross' ? 5.2 : 4.7;
    const starScale = size * (hovered ? scaleBase + 0.8 : scaleBase) * (1 + Math.sin(time * 1.15 + twinkleOffset.current) * 0.06);

    starRef.current.material.opacity = pulse + (hovered ? 0.18 : 0);
    starRef.current.scale.set(starScale, starScale, 1);

    if (accentRef.current) {
      accentRef.current.material.opacity = pulse * 0.55 + (hovered ? 0.15 : 0);
      accentRef.current.scale.set(starScale * 1.08, starScale * 1.08, 1);
      accentRef.current.material.rotation = shape === 'diamond' ? Math.PI * 0.25 : Math.PI * 0.12;
    }

    if (isNew) {
      animationProgress.current = Math.min(animationProgress.current + 0.005, 1);
      if (animationProgress.current < 1 && glowRef.current) {
        const highlightFactor = 1 - animationProgress.current;
        starRef.current.material.opacity = pulse + highlightFactor * 0.35;
        const extraGlow = highlightFactor * 2.5;
        glowRef.current.scale.set(size * (5 + extraGlow), size * (5 + extraGlow), 1);
        glowRef.current.material.opacity = 0.22 * (1 - animationProgress.current) + 0.1;
      }
    } else if (glowRef.current) {
      const glowPulse = 1.6 + Math.sin(time * 1.1 + twinkleOffset.current) * 0.25;
      const hoverBoost = hovered ? 1.35 : 1;
      glowRef.current.scale.set(size * 4.8 * glowPulse * hoverBoost, size * 4.8 * glowPulse * hoverBoost, 1);
      glowRef.current.material.opacity = (0.12 + Math.sin(time * 1.05 + twinkleOffset.current) * 0.05) * (hovered ? 1.5 : 1);
    }
  });

  // Handle star hover state
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    onHoverArticle?.(article);
  }, [article, onHoverArticle]);
  
  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    setHovered(false);
    onHoverArticle?.(null);
  }, [onHoverArticle]);

  // Handle click on star to show article
  const handleStarClick = useCallback((e) => {
    e.stopPropagation();
    onSelectArticle(article);
  }, [article, onSelectArticle]);

  return (
    <group position={positionRef.current}>
      {/* Invisible larger hitbox for easier clicking */}
      <mesh
        scale={[hitboxSize, hitboxSize, hitboxSize]}
        onClick={handleStarClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <sprite ref={glowRef} scale={[size * 4.8, size * 4.8, 1]}>
        <spriteMaterial
          map={starTextures.sparkle}
          color={haloColor}
          transparent
          opacity={isNew ? 0.28 : 0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      
      <sprite ref={starRef} scale={[size * 4.7, size * 4.7, 1]}>
        <spriteMaterial
          map={starTexture}
          color={starColor}
          transparent
          opacity={isNew ? 0.92 : 0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {shape !== 'pinpoint' && (
        <sprite ref={accentRef} scale={[size * 5.1, size * 5.1, 1]}>
          <spriteMaterial
            map={starTextures.cross}
            color={starColor.clone().lerp(new THREE.Color('#c8e8ff'), 0.2)}
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      )}
      
    </group>
  );
};

// Format date for display - utility function 
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Main visualization component
const StarfieldVisualization = () => {
  const starTextures = useStarTextures();
  const { 
    latestArticles, 
    isLoadingLatest, 
    latestError
  } = useNews();
  
  // State for section filtering
  const [selectedSections, setSelectedSections] = useState([]);
  
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [hoveredArticle, setHoveredArticle] = useState(null);
  
  // Track article IDs to detect new articles
  const [knownArticleIds, setKnownArticleIds] = useState(new Set());
  const [newArticles, setNewArticles] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const [articleCount, setArticleCount] = useState(0);

  // Get unique sections from articles
  const uniqueSections = useMemo(() => {
    const sections = new Set();
    
    if (latestArticles?.length) {
      latestArticles.forEach(article => sections.add(article.section));
    }
    
    return [...sections].sort();
  }, [latestArticles]);

  // Toggle a section for filtering
  const toggleSection = useCallback((section) => {
    setSelectedSections(prev => {
      if (prev.includes(section)) {
        return prev.filter(s => s !== section);
      } else {
        return [...prev, section];
      }
    });
  }, []);

  // Handle article selection
  const handleSelectArticle = useCallback((article) => {
    setHoveredArticle(null);
    setSelectedArticle(article);
  }, []);

  // Close article modal
  const handleCloseArticle = useCallback(() => {
    console.log("Closing article modal");
    setSelectedArticle(null);
  }, []);

  // Filter articles based on selected sections
  const filteredArticles = useMemo(() => {
    if (selectedSections.length === 0) {
      return latestArticles;
    }
    return latestArticles?.filter(article => selectedSections.includes(article.section)) || [];
  }, [latestArticles, selectedSections]);

  useEffect(() => {
    if (latestArticles?.length) {
      setArticleCount(latestArticles.length);
    }
  }, [latestArticles]);

  // Track new articles when latestArticles changes
  useEffect(() => {
    if (latestArticles?.length) {
      // Identify new articles
      const currentIds = new Set(latestArticles.map(article => 
        article.uri || article.url || article.id || JSON.stringify(article)
      ));
      
      // Find articles that aren't in our known set
      const newArticleIds = [];
      const newArticlesList = [];
      
      latestArticles.forEach(article => {
        const articleId = article.uri || article.url || article.id || JSON.stringify(article);
        if (!knownArticleIds.has(articleId)) {
          newArticleIds.push(articleId);
          newArticlesList.push(article);
        }
      });
      
      // If we have new articles, show notification
      if (newArticlesList.length > 0 && knownArticleIds.size > 0) {
        setNewArticles(newArticlesList);
        setNotificationCount(newArticlesList.length);
        setShowNotification(true);
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
      
      // Update known article IDs
      setKnownArticleIds(prev => {
        const updatedSet = new Set(prev);
        newArticleIds.forEach(id => updatedSet.add(id));
        return updatedSet;
      });
    }
  }, [latestArticles]);

  // Add key press handler for escape to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedArticle) {
        console.log("Escape key pressed, closing article");
        setSelectedArticle(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedArticle]);

  // Display loading state
  if (isLoadingLatest && latestArticles.length === 0) {
    return (
      <LoadingContainer>
        <h3>Loading NYT News Starfield</h3>
        <p>Fetching article data...</p>
        <div className="loading-spinner"></div>
      </LoadingContainer>
    );
  }

  // Display error state
  if (latestError && latestArticles.length === 0) {
    return (
      <ErrorContainer>
        <h3>Error Loading Data</h3>
        <p>{latestError}</p>
        <p>Please check your API key and connection.</p>
      </ErrorContainer>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas 
        camera={{ position: [0, 0, 50], fov: 60 }} 
        gl={{ antialias: true }}
      >
        <color attach="background" args={[colors.midnightAbyss]} />
        <fog attach="fog" args={[colors.midnightAbyss, 70, 210]} />
        <ambientLight intensity={0.2} color={colors.arcticMist} />
        <pointLight position={[0, 0, 20]} intensity={0.9} color={colors.comet} />
        <pointLight position={[-80, 40, -30]} intensity={0.28} color={colors.celestialLight} />
        <pointLight position={[80, -30, -50]} intensity={0.2} color={colors.neonViolet} />
        
        <DeepNebulaField starTextures={starTextures} count={22} />
        <AuroraRibbons starTextures={starTextures} />
        <OrbitalRings />
        <LightPillars starTextures={starTextures} />
        <DistantGalaxies starTextures={starTextures} />
        <ConstellationWeb />
        <StarClusters starTextures={starTextures} clusterCount={10} />
        <CosmicDust count={160} starTextures={starTextures} />
        <NebulaMist starTextures={starTextures} />
        <BackgroundStars count={900} starTextures={starTextures} />
        <ShootingStars starTextures={starTextures} />
        
        {/* Articles as stars */}
        {filteredArticles && filteredArticles.length > 0 && filteredArticles.map((article, index) => {
          // Check if this article is new
          const articleId = article.uri || article.url || article.id || JSON.stringify(article);
          const isNewArticle = newArticles.some(a => 
            (a.uri || a.url || a.id || JSON.stringify(a)) === articleId
          );
          
          return (
            <ArticleStar 
              key={`article-${index}`} 
              article={article} 
              index={index}
              onSelectArticle={handleSelectArticle}
              onHoverArticle={setHoveredArticle}
              isNew={isNewArticle}
              starTextures={starTextures}
            />
          );
        })}
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={300}
          maxPolarAngle={Math.PI * 0.75}
          dampingFactor={0.1}
          rotateSpeed={0.5}
          zoomSpeed={0.7}
        />
      </Canvas>

      <HorizonGlow />
      <SceneVignette />
      
      <HudBar>
        <HudBrand>
          <HudTitle>NYT News Observatory</HudTitle>
          <HudMeta>{articleCount} articles, last 24 hours</HudMeta>
        </HudBrand>
        <SectionFilterRow>
          {uniqueSections.map((section) => (
            <SectionFilterButton
              key={section}
              type="button"
              onClick={() => toggleSection(section)}
              $active={selectedSections.includes(section)}
            >
              <ColorIndicator $color={getSectionColor(section)} />
              {section}
            </SectionFilterButton>
          ))}
        </SectionFilterRow>
      </HudBar>

      <HoverCaption $visible={!!hoveredArticle && !selectedArticle}>
        {hoveredArticle && (
          <>
            <HoverSection>{hoveredArticle.section}</HoverSection>
            <HoverTitle>{hoveredArticle.title}</HoverTitle>
          </>
        )}
      </HoverCaption>

      <Toast $visible={showNotification}>
        {notificationCount} new {notificationCount === 1 ? 'article' : 'articles'}
      </Toast>

      {selectedArticle && (
        <>
          <ArticleOverlay onClick={handleCloseArticle} aria-hidden />
          <ArticleCard onClick={(e) => e.stopPropagation()}>
            <CardClose type="button" onClick={handleCloseArticle} aria-label="Close">
              Close
            </CardClose>
            <CardHeader>
              <CardMeta>
                <CardSection>{selectedArticle.section}</CardSection>
                <CardDate>
                  {new Date(selectedArticle.published_date || selectedArticle.pub_date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </CardDate>
              </CardMeta>
              <CardTitle>{selectedArticle.title}</CardTitle>
            </CardHeader>
            <CardBody>
              {selectedArticle.abstract && <CardAbstract>{selectedArticle.abstract}</CardAbstract>}
              {selectedArticle.byline && (
                <CardByline>{selectedArticle.byline.original || selectedArticle.byline}</CardByline>
              )}
            </CardBody>
            <CardActions>
              <a href={selectedArticle.url || selectedArticle.web_url} target="_blank" rel="noopener noreferrer">
                Read article
              </a>
              <button type="button" onClick={handleCloseArticle}>Close</button>
            </CardActions>
          </ArticleCard>
        </>
      )}

    </div>
  );
};

export default StarfieldVisualization; 