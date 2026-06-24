'use client';

import { useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './VideoPlayer.module.css';

export type VideoQuality = '480p' | '720p' | '1080p';

export type VideoSource = {
  quality: VideoQuality;
  url: string;
  isDefault?: boolean;
  canDownload?: boolean;
  filename?: string;
};

type VideoPlayerProps = {
  title: string;
  sources: VideoSource[];
  allowDownload?: boolean;
};

export function VideoPlayer({ title, sources, allowDownload = false }: VideoPlayerProps) {
  const t = useTranslations('VideoPlayer'); // فراخوانی ترجمه‌ها از next-intl
  
  const sortedSources = useMemo(() => {
    const qualityOrder: Record<VideoQuality, number> = {
      '480p': 0,
      '720p': 1,
      '1080p': 2,
    };
    return [...sources].sort((a, b) => qualityOrder[a.quality] - qualityOrder[b.quality]);
  }, [sources]);

  const defaultSource =
    sortedSources.find((source) => source.isDefault) ??
    sortedSources.find((source) => source.quality === '720p') ??
    sortedSources[0];
    
  const [activeSource, setActiveSource] = useState(defaultSource);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleQualityChange = (source: VideoSource) => {
    const video = videoRef.current;
    const currentTime = video?.currentTime ?? 0;
    const wasPlaying = Boolean(video && !video.paused);

    setActiveSource(source);

    window.requestAnimationFrame(() => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = currentTime;
      if (wasPlaying) {
        void videoRef.current.play();
      }
    });
  };

  if (!activeSource) {
    return (
      <section className={styles.emptyState}>
        {t('emptyState')}
      </section>
    );
  }

  const downloadableSources = allowDownload
    ? sortedSources.filter((source) => source.canDownload !== false)
    : [];

  return (
    <section className={styles.playerShell} aria-label={`Video Player ${title}`}>
      <div className={styles.videoFrame}>
        <video
          ref={videoRef}
          key={activeSource.url}
          className={styles.video}
          src={activeSource.url}
          controls
          preload="metadata"
        >
          {t('videoNotSupported')}
        </video>
      </div>

      <div className={styles.controlsPanel}>
        <div>
          <p className={styles.eyebrow}>{t('currentQuality')}</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>
            {t('defaultInfo', { quality: activeSource.quality })}
          </p>
        </div>

        <div className="flex gap-2" aria-label="Quality Selection">
          {sortedSources.map((source) => (
            <button
              key={source.quality}
              type="button"
              className={`${styles.qualityButton} ${source.quality === activeSource.quality ? styles.activeQuality : ''}`}
              onClick={() => handleQualityChange(source)}
            >
              {source.quality}
            </button>
          ))}
        </div>
      </div>

      {downloadableSources.length > 0 ? (
        <div className={styles.downloadPanel}>
          <p className={styles.eyebrow}>{t('downloadFile')}</p>
          <div className={styles.downloadLinks}>
            {downloadableSources.map((source) => (
              <a
                key={source.quality}
                className={styles.downloadLink}
                href={source.url}
                download={source.filename ?? `${title}-${source.quality}.mp4`}
              >
                {t('downloadQuality', { quality: source.quality })}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <p className={styles.downloadDisabled}>{t('downloadDisabled')}</p>
      )}
    </section>
  );
}