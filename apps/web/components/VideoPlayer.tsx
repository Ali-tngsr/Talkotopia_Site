'use client';

import { useMemo, useRef, useState } from 'react';
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
      if (!videoRef.current) {
        return;
      }

      videoRef.current.currentTime = currentTime;
      if (wasPlaying) {
        void videoRef.current.play();
      }
    });
  };

  if (!activeSource) {
    return (
      <section className={styles.emptyState} dir="rtl">
        هیچ لینک ویدیویی برای این جلسه ثبت نشده است.
      </section>
    );
  }

  const downloadableSources = allowDownload
    ? sortedSources.filter((source) => source.canDownload !== false)
    : [];

  return (
    <section className={styles.playerShell} dir="rtl" aria-label={`پلیر ویدیو ${title}`}>
      <div className={styles.videoFrame}>
        <video
          ref={videoRef}
          key={activeSource.url}
          className={styles.video}
          src={activeSource.url}
          controls
          preload="metadata"
        >
          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
        </video>
      </div>

      <div className={styles.controlsPanel}>
        <div>
          <p className={styles.eyebrow}>کیفیت فعلی</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>
            پخش با کیفیت {activeSource.quality}. کیفیت 720p پیش‌فرض است و کیفیت‌های دیگر فقط در صورت
            ثبت URL نمایش داده می‌شوند.
          </p>
        </div>

        <div className={styles.qualityGroup} aria-label="انتخاب کیفیت ویدیو">
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
          <p className={styles.eyebrow}>دانلود فایل</p>
          <div className={styles.downloadLinks}>
            {downloadableSources.map((source) => (
              <a
                key={source.quality}
                className={styles.downloadLink}
                href={source.url}
                download={source.filename ?? `${title}-${source.quality}.mp4`}
              >
                دانلود {source.quality}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <p className={styles.downloadDisabled}>دانلود برای این جلسه فعال نیست.</p>
      )}
    </section>
  );
}
