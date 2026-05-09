import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './LightRays.css';

const vertex = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor;
uniform vec2 uOrigin;
uniform vec2 uMouse;
uniform float uRaysSpeed;
uniform float uLightSpread;
uniform float uRayLength;
uniform float uFollowMouse;
uniform float uMouseInfluence;
uniform float uNoiseAmount;
uniform float uDistortion;
uniform float uPulsating;
uniform float uFadeDistance;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 origin = vec2(uOrigin.x, 1.0 - uOrigin.y);

  if (uFollowMouse > 0.5) {
    origin = mix(origin, uMouse, uMouseInfluence);
  }

  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 delta = (uv - origin) * aspect;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x);
  float drift = uTime * uRaysSpeed;
  float beams = 0.0;

  for (float i = 0.0; i < 8.0; i += 1.0) {
    float jitter = noise(vec2(angle * 2.4 + drift * 0.08, i * 1.7));
    float wave = sin(angle * (7.5 + i * 1.4) + drift * (0.42 + i * 0.025) + jitter * uDistortion * 18.0);
    float spread = smoothstep(1.0 - (uLightSpread * 0.58), 1.0, wave);
    beams += spread * (1.0 - i * 0.075);
  }

  beams = pow(max(beams / 4.8, 0.0), 1.38);

  float distanceFade = 1.0 - smoothstep(uFadeDistance * 0.42, uFadeDistance, dist);
  float lengthFade = exp(-dist * (2.05 / max(uRayLength, 0.08)));
  float pulse = mix(1.0, 0.82 + 0.18 * sin(uTime * 1.35), uPulsating);
  float grain = noise(uv * uResolution.xy * 0.018 + vec2(drift * 0.08, -drift * 0.04));
  float intensity = beams * distanceFade * lengthFade * pulse;
  float atmosphere = grain * uNoiseAmount * distanceFade;

  vec3 color = uColor * (intensity + atmosphere);
  float alpha = clamp(intensity * 0.76 + atmosphere * 0.34, 0.0, 0.78);
  gl_FragColor = vec4(color, alpha);
}
`;

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized,
    16,
  );

  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function resolveOrigin(origin) {
  const origins = {
    'top-left': [0.08, 0.0],
    'top-center': [0.5, 0.0],
    'top-right': [0.92, 0.0],
    'center-left': [0.0, 0.5],
    center: [0.5, 0.5],
    'center-right': [1.0, 0.5],
    'bottom-left': [0.08, 1.0],
    'bottom-center': [0.5, 1.0],
    'bottom-right': [0.92, 1.0],
  };

  return origins[origin] ?? origins['top-center'];
}

export default function LightRays({
  raysOrigin = 'top-center',
  raysColor = '#b91c1c',
  raysSpeed = 0.8,
  lightSpread = 0.7,
  rayLength = 1.3,
  followMouse = true,
  mouseInfluence = 0.04,
  noiseAmount = 0.03,
  distortion = 0.02,
  pulsating = true,
  fadeDistance = 1.2,
  className = '',
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    const { gl } = renderer;

    gl.clearColor(0, 0, 0, 0);
    gl.canvas.className = 'light-rays__canvas';
    container.appendChild(gl.canvas);

    const uniforms = {
      uResolution: { value: [1, 1] },
      uTime: { value: 0 },
      uColor: { value: hexToRgb(raysColor) },
      uOrigin: { value: resolveOrigin(raysOrigin) },
      uMouse: { value: [0.5, 0.5] },
      uRaysSpeed: { value: raysSpeed },
      uLightSpread: { value: lightSpread },
      uRayLength: { value: rayLength },
      uFollowMouse: { value: followMouse && !reducedMotion ? 1 : 0 },
      uMouseInfluence: { value: mouseInfluence },
      uNoiseAmount: { value: noiseAmount },
      uDistortion: { value: distortion },
      uPulsating: { value: pulsating && !reducedMotion ? 1 : 0 },
      uFadeDistance: { value: fadeDistance },
    };

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms,
    });
    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });
    let frameId = 0;

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
      renderer.render({ scene: mesh });
    };

    const handleMouseMove = (event) => {
      if (reducedMotion || !followMouse) return;
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const y = 1 - (event.clientY - rect.top) / Math.max(rect.height, 1);
      uniforms.uMouse.value = [Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1)];
    };

    const tick = (time) => {
      uniforms.uTime.value = time * 0.001;
      renderer.render({ scene: mesh });
      frameId = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    container.addEventListener('mousemove', handleMouseMove);

    if (!reducedMotion) {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', handleMouseMove);
      geometry.remove();
      program.remove();
      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    distortion,
    fadeDistance,
    followMouse,
    lightSpread,
    mouseInfluence,
    noiseAmount,
    pulsating,
    rayLength,
    raysColor,
    raysOrigin,
    raysSpeed,
  ]);

  return <div ref={containerRef} className={`light-rays ${className}`} aria-hidden="true" />;
}
