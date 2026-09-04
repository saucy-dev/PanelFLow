import React, { useEffect, useRef } from 'react';

export type GradientWavesDetail = 'low' | 'medium' | 'high';

export interface GradientWavesProps {
  horizonColor?: string;
  waveColor?: string;
  crestColor?: string;
  speed?: number;
  amplitude?: number;
  waveScale?: number;
  waveRatio?: number;
  swell?: number;
  turbulence?: number;
  tilt?: number;
  zoom?: number;
  height?: number;
  fogDepth?: number;
  detail?: GradientWavesDetail;
  brightness?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  parallaxStrength?: number;
  grain?: boolean;
  grainIntensity?: number;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const detailToSteps = (detail: GradientWavesDetail): number => {
  if (detail === 'low') return 40.0;
  if (detail === 'high') return 110.0;
  return 70.0;
};

const vertexShaderSource = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

interface UniformLocations {
  iResolution: WebGLUniformLocation | null;
  iTime: WebGLUniformLocation | null;
  uSpeed: WebGLUniformLocation | null;
  uAmplitude: WebGLUniformLocation | null;
  uWaveScale: WebGLUniformLocation | null;
  uWaveRatio: WebGLUniformLocation | null;
  uSwell: WebGLUniformLocation | null;
  uTurbulence: WebGLUniformLocation | null;
  uTilt: WebGLUniformLocation | null;
  uZoom: WebGLUniformLocation | null;
  uHeight: WebGLUniformLocation | null;
  uFogDepth: WebGLUniformLocation | null;
  uSteps: WebGLUniformLocation | null;
  uBrightness: WebGLUniformLocation | null;
  uOpacity: WebGLUniformLocation | null;
  uGrain: WebGLUniformLocation | null;
  uGrainIntensity: WebGLUniformLocation | null;
  uMouse: WebGLUniformLocation | null;
  uParallax: WebGLUniformLocation | null;
  uEnableMouse: WebGLUniformLocation | null;
  uHorizonColor: WebGLUniformLocation | null;
  uWaveColor: WebGLUniformLocation | null;
  uCrestColor: WebGLUniformLocation | null;
}

export const GradientWaves: React.FC<GradientWavesProps> = ({
  horizonColor = '#0B0F19',
  waveColor = '#FFBE91',
  crestColor = '#CFEBFF',
  speed = 0.35,
  amplitude = 2.4,
  waveScale = 0.65,
  waveRatio = 0.95,
  swell = 32,
  turbulence = 18,
  tilt = 1.15,
  zoom = 1.0,
  height = 5.2,
  fogDepth = 15,
  detail = 'medium',
  brightness = 1.0,
  opacity = 1.0,
  mouseInteraction = true,
  parallaxStrength = 0.45,
  grain = true,
  grainIntensity = 0.04,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<UniformLocations | null>(null);
  const enableMouseRef = useRef<boolean>(mouseInteraction);
  const propsRef = useRef({
    horizonColor,
    waveColor,
    crestColor,
    speed,
    amplitude,
    waveScale,
    waveRatio,
    swell,
    turbulence,
    tilt,
    zoom,
    height,
    fogDepth,
    detail,
    brightness,
    opacity,
    grain,
    grainIntensity,
    mouseInteraction,
    parallaxStrength,
  });

  // Keep propsRef updated
  useEffect(() => {
    propsRef.current = {
      horizonColor,
      waveColor,
      crestColor,
      speed,
      amplitude,
      waveScale,
      waveRatio,
      swell,
      turbulence,
      tilt,
      zoom,
      height,
      fogDepth,
      detail,
      brightness,
      opacity,
      grain,
      grainIntensity,
      mouseInteraction,
      parallaxStrength,
    };
    enableMouseRef.current = mouseInteraction;
  }, [
    horizonColor,
    waveColor,
    crestColor,
    speed,
    amplitude,
    waveScale,
    waveRatio,
    swell,
    turbulence,
    tilt,
    zoom,
    height,
    fogDepth,
    detail,
    brightness,
    opacity,
    grain,
    grainIntensity,
    mouseInteraction,
    parallaxStrength,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });

    if (!gl) {
      console.warn('WebGL2 not supported on this device/browser');
      return;
    }
    glRef.current = gl;

    // Helper: Compile Shader
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    // Full-screen Triangle
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // 3 vertices covering [-1,-1] to [3, -1], [-1, 3]
    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posAttrLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttrLoc);
    gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0);

    // Get Uniform Locations
    const uniforms: UniformLocations = {
      iResolution: gl.getUniformLocation(program, 'iResolution'),
      iTime: gl.getUniformLocation(program, 'iTime'),
      uSpeed: gl.getUniformLocation(program, 'uSpeed'),
      uAmplitude: gl.getUniformLocation(program, 'uAmplitude'),
      uWaveScale: gl.getUniformLocation(program, 'uWaveScale'),
      uWaveRatio: gl.getUniformLocation(program, 'uWaveRatio'),
      uSwell: gl.getUniformLocation(program, 'uSwell'),
      uTurbulence: gl.getUniformLocation(program, 'uTurbulence'),
      uTilt: gl.getUniformLocation(program, 'uTilt'),
      uZoom: gl.getUniformLocation(program, 'uZoom'),
      uHeight: gl.getUniformLocation(program, 'uHeight'),
      uFogDepth: gl.getUniformLocation(program, 'uFogDepth'),
      uSteps: gl.getUniformLocation(program, 'uSteps'),
      uBrightness: gl.getUniformLocation(program, 'uBrightness'),
      uOpacity: gl.getUniformLocation(program, 'uOpacity'),
      uGrain: gl.getUniformLocation(program, 'uGrain'),
      uGrainIntensity: gl.getUniformLocation(program, 'uGrainIntensity'),
      uMouse: gl.getUniformLocation(program, 'uMouse'),
      uParallax: gl.getUniformLocation(program, 'uParallax'),
      uEnableMouse: gl.getUniformLocation(program, 'uEnableMouse'),
      uHorizonColor: gl.getUniformLocation(program, 'uHorizonColor'),
      uWaveColor: gl.getUniformLocation(program, 'uWaveColor'),
      uCrestColor: gl.getUniformLocation(program, 'uCrestColor'),
    };
    uniformsRef.current = uniforms;

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    const currentMouse: [number, number] = [0.5, 0.5];
    const targetMouse: [number, number] = [0.5, 0.5];

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse[0] = (e.clientX - rect.left) / rect.width;
      targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    const onPointerLeave = () => {
      targetMouse[0] = 0.5;
      targetMouse[1] = 0.5;
    };

    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onPointerLeave);

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const loop = (t: number) => {
      if (!gl || !program || !uniforms) return;

      const p = propsRef.current;
      gl.useProgram(program);
      gl.bindVertexArray(vao);

      const timeSec = (t - t0) * 0.001;
      const tx = enableMouseRef.current ? targetMouse[0] : 0.5;
      const ty = enableMouseRef.current ? targetMouse[1] : 0.5;
      currentMouse[0] += 0.05 * (tx - currentMouse[0]);
      currentMouse[1] += 0.05 * (ty - currentMouse[1]);

      // Set Uniforms
      gl.uniform2f(uniforms.iResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform1f(uniforms.iTime, timeSec);
      gl.uniform1f(uniforms.uSpeed, p.speed);
      gl.uniform1f(uniforms.uAmplitude, p.amplitude);
      gl.uniform1f(uniforms.uWaveScale, p.waveScale);
      gl.uniform1f(uniforms.uWaveRatio, p.waveRatio);
      gl.uniform1f(uniforms.uSwell, p.swell);
      gl.uniform1f(uniforms.uTurbulence, p.turbulence);
      gl.uniform1f(uniforms.uTilt, p.tilt);
      gl.uniform1f(uniforms.uZoom, p.zoom);
      gl.uniform1f(uniforms.uHeight, p.height);
      gl.uniform1f(uniforms.uFogDepth, p.fogDepth);
      gl.uniform1f(uniforms.uSteps, detailToSteps(p.detail));
      gl.uniform1f(uniforms.uBrightness, p.brightness);
      gl.uniform1f(uniforms.uOpacity, p.opacity);
      gl.uniform1f(uniforms.uGrain, p.grain ? 1.0 : 0.0);
      gl.uniform1f(uniforms.uGrainIntensity, p.grainIntensity);
      gl.uniform2f(uniforms.uMouse, currentMouse[0], currentMouse[1]);
      gl.uniform1f(uniforms.uParallax, p.parallaxStrength);
      gl.uniform1i(uniforms.uEnableMouse, p.mouseInteraction ? 1 : 0);

      const hc = hexToRgb(p.horizonColor);
      const wc = hexToRgb(p.waveColor);
      const cc = hexToRgb(p.crestColor);
      gl.uniform3f(uniforms.uHorizonColor, hc[0], hc[1], hc[2]);
      gl.uniform3f(uniforms.uWaveColor, wc[0], wc[1], wc[2]);
      gl.uniform3f(uniforms.uCrestColor, cc[0], cc[1], cc[2]);

      // Draw Full-screen Triangle
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) {
        raf = requestAnimationFrame(loop);
      }
    };

    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        isVisible ? tryStart() : tryStop();
      },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? tryStart() : tryStop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      try {
        container.removeChild(canvas);
      } catch {}
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden select-none ${className}`.trim()}
    />
  );
};

export default GradientWaves;
