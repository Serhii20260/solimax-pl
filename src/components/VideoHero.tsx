// src/components/VideoHero.tsx
import { useRef, useEffect, useState } from 'react';

interface VideoHeroProps {
  /** Video source URL (MP4) */
  videoSrc?: string;
  /** WebM video source (optional, for better compression) */
  videoSrcWebm?: string;
  /** Fallback poster image */
  posterSrc?: string;
  /** Main heading text */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Primary CTA button */
  primaryCta?: {
    text: string;
    href: string;
  };
  /** Secondary CTA button */
  secondaryCta?: {
    text: string;
    href: string;
  };
  /** Background tech labels (low opacity) */
  techLabels?: string[];
  /** Min height class */
  minHeight?: string;
}

export default function VideoHero({
  videoSrc,
  videoSrcWebm,
  posterSrc,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  techLabels = ['PV', 'BESS', 'EPC'],
  minHeight = 'min-h-[50vh] md:min-h-[60vh]',
}: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setIsLoaded(true);
    const handleError = () => setVideoFailed(true);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const showVideo = videoSrc && !videoFailed;

  return (
    <section className={`relative w-full ${minHeight} overflow-hidden`}>
      {/* Video or Poster Background */}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={posterSrc}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {videoSrcWebm && <source src={videoSrcWebm} type="video/webm" />}
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : posterSrc ? (
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
      )}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/30" />

      {/* Tech Labels (Background, low opacity) */}
      {techLabels.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="flex gap-8 md:gap-16 text-white/10 text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider select-none">
            {techLabels.map((label, i) => (
              <span key={i} className="whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl text-center">
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl drop-shadow-lg">
            {title}
          </h1>
          
          {subtitle && (
            <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto md:text-xl drop-shadow">
              {subtitle}
            </p>
          )}

          {/* CTA Buttons */}
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              {primaryCta && (
                <a
                  href={primaryCta.href}
                  className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-yellow-300 hover:shadow-xl"
                >
                  {primaryCta.text}
                </a>
              )}
              {secondaryCta && (
                <a
                  href={secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-white/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 hover:border-white/70"
                >
                  {secondaryCta.text}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
