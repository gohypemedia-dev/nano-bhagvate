# Local Video Storage (लोकल वीडियो फ़ाइलें)

Place your `.mp4` video files in this folder (`public/videos/`).
For example:
- `public/videos/my-event.mp4`

Then in `data/gallery.ts`, reference it like:
```ts
{
  id: "video-my-event",
  type: "video",
  title: "My Event Name",
  titleHi: "मेरे कार्यक्रम का नाम",
  src: "/videos/my-event.mp4",
  thumbnail: "/images/event-poster.jpg",
  alt: "Video of my event",
  videoProvider: "mp4",
  displayOrder: 15,
}
```
Supported video formats: MP4 (H.264/AAC for best cross-browser compatibility).
