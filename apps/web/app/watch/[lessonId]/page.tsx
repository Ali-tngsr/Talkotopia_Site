import { VideoPlayer, type VideoSource } from '../../components/VideoPlayer';
import styles from './page.module.css';

type WatchPageProps = {
  params: Promise<{ lessonId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { lessonId } = await params;
  const query = (await searchParams) ?? {};

  const title = getParam(query, 'title') ?? `جلسه ${lessonId}`;
  const allowDownload = getParam(query, 'download') === 'true';
  const q720 =
    getParam(query, 'q720') ??
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  const q1080 = getParam(query, 'q1080');
  const q480 = getParam(query, 'q480');

  const sources: VideoSource[] = [
    {
      quality: '720p',
      url: q720,
      isDefault: true,
      canDownload: allowDownload,
      filename: `${lessonId}-720p.mp4`,
    },
    ...(q1080
      ? [
          {
            quality: '1080p' as const,
            url: q1080,
            canDownload: allowDownload,
            filename: `${lessonId}-1080p.mp4`,
          },
        ]
      : []),
    ...(q480
      ? [
          {
            quality: '480p' as const,
            url: q480,
            canDownload: allowDownload,
            filename: `${lessonId}-480p.mp4`,
          },
        ]
      : []),
  ];

  return (
    <main className={styles.page} dir="rtl">
      <header className={styles.header}>
        <p className={styles.badge}>Talkotopia LMS MVP</p>
        <h1>تماشای جلسه ضبط‌شده</h1>
        <p>
          این صفحه پلیر MVP را با URLهای دستی کیفیت‌ها نمایش می‌دهد. در اتصال واقعی، همین داده‌ها از
          API رسانه جلسه دریافت می‌شوند.
        </p>
      </header>
      <VideoPlayer title={title} sources={sources} allowDownload={allowDownload} />
    </main>
  );
}
