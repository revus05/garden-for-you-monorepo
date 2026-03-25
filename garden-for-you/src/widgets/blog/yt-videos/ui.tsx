import { requireEnv } from "@/shared/lib";

type Videos = { url: string }[];

export const BlogYouTubeVideos = async () => {
  const response = await fetch(
    `${requireEnv(
      "NEXT_PUBLIC_CONTENT_TABLE_URL",
      process.env.NEXT_PUBLIC_CONTENT_TABLE_URL,
    )}/Видео для Блога`,
  );

  const data = (await response.json()) as Videos;

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-2xl text-center">
        Следите за нами в YouTube
      </h2>
      {data.map((video: { url: string }, index: number) => {
        const videoId = video.url.split("v=")[1]?.split("&")[0] || "";
        const embedUrl = videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : "";

        if (!embedUrl) return null;

        return (
          <div
            key={video.url || index}
            className="aspect-video w-full max-w-xl mx-auto"
          >
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        );
      })}
    </div>
  );
};
