import React from 'react';
import { GradientWaves, GradientWavesDetail } from './GradientWaves.js';
import { useThemeStore } from '../../store/themeStore.js';

export type WaveColorPreset = 'signature' | 'apricot' | 'ice' | 'velvet';

interface DisplayWavesBackgroundProps {
  preset?: WaveColorPreset;
  speed?: number;
  intensity?: 'subtle' | 'normal' | 'vibrant';
  detail?: GradientWavesDetail;
  interactive?: boolean;
}

export const DisplayWavesBackground: React.FC<DisplayWavesBackgroundProps> = ({
  preset = 'signature',
  speed = 0.32,
  intensity = 'normal',
  detail = 'medium',
  interactive = true,
}) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // Palette schemes meticulously tuned for PanelFlow's design language
  // Brand colors: Peach (#FFBE91), Apricot (#FFDDB0), Cream (#FFFCE1), Ice (#CFEBFF), Dark Navy (#0B0F19)
  const getThemePalette = () => {
    switch (preset) {
      case 'apricot':
        return isDark
          ? {
              horizonColor: '#0E0C16',
              waveColor: '#F59E0B',
              crestColor: '#FFDDB0',
              brightness: intensity === 'vibrant' ? 1.2 : intensity === 'subtle' ? 0.75 : 0.95,
              opacity: isDark ? 0.9 : 0.85,
            }
          : {
              horizonColor: '#FFFDF0',
              waveColor: '#FFDDB0',
              crestColor: '#FFBE91',
              brightness: intensity === 'vibrant' ? 1.05 : intensity === 'subtle' ? 0.9 : 1.0,
              opacity: 0.85,
            };

      case 'ice':
        return isDark
          ? {
              horizonColor: '#070F1E',
              waveColor: '#38BDF8',
              crestColor: '#CFEBFF',
              brightness: intensity === 'vibrant' ? 1.25 : intensity === 'subtle' ? 0.75 : 1.0,
              opacity: 0.9,
            }
          : {
              horizonColor: '#F0F9FF',
              waveColor: '#93C5FD',
              crestColor: '#CFEBFF',
              brightness: 1.0,
              opacity: 0.8,
            };

      case 'velvet':
        return isDark
          ? {
              horizonColor: '#0C0A1A',
              waveColor: '#818CF8',
              crestColor: '#FFBE91',
              brightness: intensity === 'vibrant' ? 1.2 : intensity === 'subtle' ? 0.75 : 0.95,
              opacity: 0.9,
            }
          : {
              horizonColor: '#FAF5FF',
              waveColor: '#DDD6FE',
              crestColor: '#FFBE91',
              brightness: 1.0,
              opacity: 0.85,
            };

      case 'signature':
      default:
        return isDark
          ? {
              // Signature Dark: Deep Navy Horizon -> Warm Peach Wave Body -> Radiant Ice Blue Crests
              horizonColor: '#070A12',
              waveColor: '#EA9661',
              crestColor: '#CFEBFF',
              brightness: intensity === 'vibrant' ? 1.25 : intensity === 'subtle' ? 0.8 : 1.05,
              opacity: 0.92,
            }
          : {
              // Signature Light: Cream Horizon -> Soft Warm Peach Wave Body -> Light Ice Blue & White Crests
              horizonColor: '#FFFCE1',
              waveColor: '#FFBE91',
              crestColor: '#CFEBFF',
              brightness: intensity === 'vibrant' ? 1.1 : intensity === 'subtle' ? 0.9 : 1.0,
              opacity: 0.85,
            };
    }
  };

  const palette = getThemePalette();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Background base filler */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark ? 'bg-[#070A12]' : 'bg-[#FFFCE1]'
        }`}
      />

      {/* Raymarched Gradient Waves (ReactBits) */}
      <div className="absolute inset-0">
        <GradientWaves
          horizonColor={palette.horizonColor}
          waveColor={palette.waveColor}
          crestColor={palette.crestColor}
          speed={speed}
          amplitude={2.5}
          waveScale={0.65}
          waveRatio={0.95}
          swell={32}
          turbulence={18}
          tilt={1.12}
          zoom={1.02}
          height={5.2}
          fogDepth={16}
          detail={detail}
          brightness={palette.brightness}
          opacity={palette.opacity}
          mouseInteraction={interactive}
          parallaxStrength={0.4}
          grain={true}
          grainIntensity={isDark ? 0.04 : 0.025}
        />
      </div>

      {/* Cinematic Vignette for Ultra-Sharp Forefront Card Legibility */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(7, 10, 18, 0.45) 80%, rgba(7, 10, 18, 0.85) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(255, 252, 225, 0.4) 80%, rgba(255, 252, 225, 0.75) 100%)',
        }}
      />
    </div>
  );
};

export default DisplayWavesBackground;
