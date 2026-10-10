import { GalleryItem, VideoProvider } from "@/data/gallery";

export interface ParsedVideo {
  provider: VideoProvider;
  embedUrl: string;
  externalUrl: string;
  videoId: string;
}

/**
 * Robust parser for YouTube, Vimeo, and MP4 video sources.
 */
export function parseVideoSource(src: string, explicitProvider?: VideoProvider): ParsedVideo {
  const cleanSrc = src.trim();

  // 1. YouTube Detection (supports standard watch, short URL, embed, shorts)
  const ytMatch = cleanSrc.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (explicitProvider === "youtube" || ytMatch) {
    const videoId = ytMatch ? ytMatch[1] : cleanSrc;
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
      externalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      videoId,
    };
  }

  // 2. Vimeo Detection (supports standard vimeo.com/ID and player embeds)
  const vimeoMatch = cleanSrc.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/i
  );
  if (explicitProvider === "vimeo" || vimeoMatch) {
    const videoId = vimeoMatch ? vimeoMatch[1] : cleanSrc;
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`,
      externalUrl: `https://vimeo.com/${videoId}`,
      videoId,
    };
  }

  // 3. Native MP4 Video
  return {
    provider: "mp4",
    embedUrl: cleanSrc,
    externalUrl: cleanSrc,
    videoId: cleanSrc,
  };
}
