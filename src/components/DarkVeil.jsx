import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl';
import { useTheme } from '../state/theme';
import './DarkVeil.css';

const vertex = `
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`;

const fragment = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;
uniform float uIsWarm;

float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}

float noise(vec2 p){
  vec2 i=floor(p);
  vec2 f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  float a=rand(i);
  float b=rand(i+vec2(1.0,0.0));
  float c=rand(i+vec2(0.0,1.0));
  float d=rand(i+vec2(1.0,1.0));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm(vec2 p){
  float value=0.0;
  float amp=0.5;
  for(int i=0;i<5;i++){
    value+=amp*noise(p);
    p*=2.04;
    amp*=0.52;
  }
  return value;
}

mat3 rgb2yiq=mat3(0.299,0.587,0.114,0.596,-0.274,-0.322,0.211,-0.523,0.312);
mat3 yiq2rgb=mat3(1.0,0.956,0.621,1.0,-0.272,-0.647,1.0,-1.106,1.703);

vec3 hueShiftRGB(vec3 col,float deg){
  vec3 yiq=rgb2yiq*col;
  float rad=radians(deg);
  float c=cos(rad),s=sin(rad);
  vec3 shifted=vec3(yiq.x,yiq.y*c-yiq.z*s,yiq.y*s+yiq.z*c);
  return clamp(yiq2rgb*shifted,0.0,1.0);
}

void main(){
  vec2 uv=gl_FragCoord.xy/max(uResolution.xy,vec2(1.0));
  vec2 p=uv*2.0-1.0;
  float aspect=uResolution.x/max(uResolution.y,1.0);
  p.x*=mix(1.0,min(aspect,1.28),0.36);

  float t=uTime;
  vec2 warp=vec2(
    sin(p.y*3.8+t*0.58)+sin((p.x+p.y)*2.2-t*0.34),
    cos(p.x*4.2-t*0.42)+sin((p.y-p.x)*2.7+t*0.38)
  )*0.065*uWarp;
  p+=warp;

  float horizontal=0.72+0.28*smoothstep(-1.18,1.32,p.x);
  float veilA=fbm(p*1.65+vec2(t*0.06,-t*0.035));
  float veilB=fbm((p+vec2(1.7,-0.65))*2.45+vec2(-t*0.04,t*0.055));
  float filament=sin((p.x*1.9-p.y*0.75)+veilA*3.4+t*0.42)*0.5+0.5;
  float stream=smoothstep(0.24,0.88,filament*0.68+veilB*0.62);
  float core=1.0-smoothstep(0.14,2.24,length(p*vec2(0.54,0.96)));
  core=max(core,0.3*horizontal);
  float diagonal=smoothstep(0.12,0.92,sin((p.x*1.15+p.y*0.48)+t*0.34+veilA*2.2)*0.5+0.5);
  float glow=pow(max(stream*core,0.0),1.05);

  vec3 ink=vec3(0.012,0.011,0.016);
  vec3 charcoal=vec3(0.075,0.064,0.072);
  vec3 wine=vec3(0.34,0.026,0.038);
  vec3 crimson=vec3(0.95,0.075,0.085);
  vec3 ember=vec3(1.0,0.34,0.26);

  if (uIsWarm > 0.5) {
    ink = vec3(0.118, 0.390, 0.455);
    charcoal = vec3(0.235, 0.780, 0.910);
    wine = vec3(0.96, 0.97, 0.98); // crisp faint blue-white instead of caramel
    crimson = vec3(0.98, 0.98, 0.99); // clean near-white
    ember = vec3(0.85, 0.92, 0.95); // very light cyan instead of yellow/caramel
  }

  vec3 color=mix(ink,charcoal,veilA*0.78);
  color=mix(color,wine,stream*0.9);
  color=mix(color,crimson,glow*0.64);
  color+=ember*pow(max(veilB-0.58,0.0),2.0)*0.34;
  color+=crimson*diagonal*core*0.1;

  if (uIsWarm < 0.5) {
    color=hueShiftRGB(color,uHueShift);
  }

  float vignette=smoothstep(0.54,2.22,length(p*vec2(0.5,0.95)));
  color*=1.0-vignette*0.28;
  color+=wine*horizontal*0.08;

  float scanline=sin(gl_FragCoord.y*uScanFreq)*0.5+0.5;
  color*=1.0-(scanline*scanline)*uScan;
  color+=(rand(gl_FragCoord.xy+t)-0.5)*uNoise;

  gl_FragColor=vec4(clamp(color,0.0,1.0),1.0);
}
`;

export default function DarkVeil({
  hueShift = -8,
  noiseIntensity = 0.025,
  scanlineIntensity = 0.08,
  speed = 0.35,
  scanlineFrequency = 1.6,
  warpAmount = 0.18,
  resolutionScale = 0.82,
  className = '',
}) {
  const ref = useRef(null);
  const { isWarm } = useTheme();
  const themeRef = useRef(isWarm);

  useEffect(() => {
    themeRef.current = isWarm;
  }, [isWarm]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new Renderer({
      dpr: Math.max(Math.min(window.devicePixelRatio || 1, 1.5) * resolutionScale, 0.5),
      alpha: false,
      antialias: false,
    });
    const { gl } = renderer;
    gl.canvas.className = 'darkveil-canvas__webgl';
    container.appendChild(gl.canvas);
    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2() },
        uHueShift: { value: hueShift },
        uNoise: { value: noiseIntensity },
        uScan: { value: scanlineIntensity },
        uScanFreq: { value: scanlineFrequency },
        uWarp: { value: warpAmount },
        uIsWarm: { value: themeRef.current ? 1.0 : 0.0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);
      renderer.render({ scene: mesh });
    };

    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    let frame = 0;

    const loop = () => {
      program.uniforms.uTime.value = reducedMotion ? 0.3 : ((performance.now() - start) / 1000) * speed;
      program.uniforms.uHueShift.value = hueShift;
      program.uniforms.uNoise.value = noiseIntensity;
      program.uniforms.uScan.value = scanlineIntensity;
      program.uniforms.uScanFreq.value = scanlineFrequency;
      program.uniforms.uWarp.value = reducedMotion ? 0 : warpAmount;
      program.uniforms.uIsWarm.value = themeRef.current ? 1.0 : 0.0;
      renderer.render({ scene: mesh });
      if (!reducedMotion) frame = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      geometry.remove();
      program.remove();
      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [hueShift, noiseIntensity, scanlineIntensity, speed, scanlineFrequency, warpAmount, resolutionScale]);

  return <div ref={ref} className={`darkveil-canvas ${className}`} aria-hidden="true" />;
}
