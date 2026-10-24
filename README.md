# LiteLearn

**Every lesson, whatever your connection.**

LiteLearn helps students on slow or costly internet watch video lessons. A teacher uploads one lecture, and LiteLearn creates lighter versions, an audio-only track and sharp board photos, and shows the file size of each option before the student chooses.


- **Live demo:** [LiteLearn](https://lite-learn.vercel.app/)
- **Notion documentation:** [Notion](https://app.notion.com/p/LiteLearn-Hacktober-HackDays-Notion-Documentation-Draft-4036fd4c127d80bfaa8aecf5d446a2ff?source=copy_link)


---

## The problem

Lecture videos are large. On a weak connection or a small data plan they buffer, fail or use up a month's data, and students fall behind. Shrinking a video can also blur handwriting on the board, which is the most important part of many lessons.

## The solution

One upload becomes:

- **Three video versions:** High (720p), Medium (480p) and Low (240p)
- **An audio-only version**
- **Board photos:** sharp still frames taken from the video every 30 seconds
- **File sizes** shown before a student picks an option
- **A data-saved dashboard** that adds up the savings across lessons

A student on a weak connection can listen to the audio version and read the board photos, using a fraction of the data.

## Features

| Feature | Status |
|---|---|
| Signed direct upload from the browser to Cloudinary | Done |
| 720p, 480p, 240p and audio versions with real file sizes | Done |
| Board photos from the video | Done |
| Lesson page with quality picker and data-saved message | Done |
| Data-saved dashboard | Done |
| Landing page and responsive layout | Done |
| Teacher passcode and upload limits | Planned |
| Automatic quality recommendation for slow connections | Planned |

## How Cloudinary is used

| Capability | How LiteLearn uses it |
|---|---|
| Signed uploads | The server signs the request, and the browser uploads straight to Cloudinary, so the API secret never reaches the frontend |
| Video transformations | One call creates the 720p, 480p and 240p MP4 versions with automatic quality settings, plus an MP3 |
| Reported file sizes | The size of each version comes from Cloudinary's response, so the dashboard uses real numbers |
| Video frame extraction | Board photos are JPG frames generated from the video at set time offsets |
| Image resizing | Lesson cards and photo previews use small copies of the board photos |

## Tech stack

- **Next.js** (App Router, TypeScript) for the pages and API routes
- **Tailwind CSS** for styling
- **MongoDB Atlas** with **Mongoose** for lesson data
- **Cloudinary** for video storage, transformations and delivery
- **Vercel** for hosting

## How it works

```
Teacher's browser
   |  1. asks the server for a signed upload
   v
Next.js API (/api/sign-upload)
   |  2. browser uploads the video directly to Cloudinary
   v
Cloudinary
   |  3. server asks Cloudinary to create the versions and returns their sizes
   v
Next.js API (/api/lessons) --> MongoDB (title, sizes, version URLs, board photo URLs)
   |
   v
Students open the lesson page and choose a version
```

## Pages and API routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/lessons` | List of lessons |
| `/lesson/[id]` | Lesson page with quality picker and board photos |
| `/teacher` | Upload a lesson |
| `/dashboard` | Data-saved overview |
| `POST /api/sign-upload` | Returns a signed upload request |
| `GET, POST /api/lessons` | List lessons, create a lesson and its versions |
| `GET /api/lessons/[id]` | Get one lesson |
| `GET /api/stats` | Totals used by the dashboard |

## Getting started

### Requirements

- Node.js 20 or newer
- A free [Cloudinary](https://cloudinary.com) account (choose the developer / code and API setup)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Install

```bash
git clone 
cd litelearn
npm install
```

### Configure

Copy the example file and fill in your own values:

```bash
cp .env.example .env.local
```

```dotenv
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MONGODB_URI=
```

- Find the cloud name on the Cloudinary dashboard, and the key and secret under **Settings, then API Keys**.
- In MongoDB Atlas, allow your IP address under **Network Access**, and put a database name at the end of the connection string.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Try it

1. Go to `/teacher` and upload a short clip (1 to 2 minutes).
2. Wait for the versions to be created, then open the lesson page.
3. Switch between the video and audio options and check the file sizes.
4. Open `/dashboard` to see the total data saved.

## Project structure

```
app/
  api/
    sign-upload/route.ts     signed upload for the browser
    lessons/route.ts         list and create lessons
    lessons/[id]/route.ts    get one lesson
    stats/route.ts           data-saved totals
  components/Navbar.tsx      site navigation
  dashboard/page.tsx
  lesson/[id]/page.tsx
  lessons/page.tsx
  teacher/page.tsx
  page.tsx                   landing page
  layout.tsx
  globals.css
lib/
  cloudinary.ts              Cloudinary configuration
  mongodb.ts                 database connection
models/
  Lesson.ts                  lesson data model
```

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Add the four environment variables from `.env.example` in the project settings.
4. Deploy, then test an upload on the live site with a short clip.

Creating video versions can take a while. Very long videos may hit the time limit of your Vercel plan, so use short clips.

## Limitations

- LiteLearn needs some internet connection. It is **not** an offline tool.
- The dashboard's savings assume a student watches the Low (240p) version. It does not track real downloads.
- Board photos are taken at fixed time intervals, not when the board changes.
- Audio-only needs the video to have a sound track.
- The Cloudinary free plan has limited credits and a cap on video bandwidth, so keep demo videos short.
- Anyone who can reach the upload page can upload a lesson. A teacher passcode is planned.

## Future scope

- Automatic quality recommendation based on the student's connection
- Teacher passcode and upload limits
- Transcripts and captions
- Hindi and Marathi interface
- Downloading small versions for later viewing
- Choosing board photos when the board content changes


## Contributing

Contributions are welcome. Open an issue to discuss a change, or look for issues labelled `good first issue`. 

## License

MIT. See [LICENSE](LICENSE).

## Author

[Aihtesham Chaudhary]
