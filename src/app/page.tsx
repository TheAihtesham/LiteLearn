import Link from "next/link";

const btn =
  "inline-flex items-center justify-center rounded-lg px-5 py-3 text-center font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const steps = [
  { n: "1", title: "A teacher uploads once", text: "One lecture video goes up straight from the browser. No special format needed." },
  { n: "2", title: "LiteLearn makes it lighter", text: "Cloudinary creates smaller video versions, an audio-only track and sharp photos of the board." },
  { n: "3", title: "Students choose what fits", text: "Each option shows its file size first, so a student on a weak connection picks what works." },
];

const options = [
  { name: "High", tag: "720p", note: "Best picture, when data is not a worry" },
  { name: "Medium", tag: "480p", note: "Clear video at a smaller size" },
  { name: "Low", tag: "240p", note: "The lightest video for slow networks" },
  { name: "Audio + board", tag: "Lightest", note: "Listen to the teacher and read the board with very little data" },
];

const example = [
  { label: "Original", size: "85 MB", width: "100%", color: "bg-[#17302b]/40" },
  { label: "Low data", size: "12 MB", width: "14%", color: "bg-[#17302b]" },
  { label: "Audio only", size: "4 MB", width: "5%", color: "bg-[#e8b23a]" },
];

const card = "rounded-xl border border-[#17302b]/15 bg-white p-5 sm:p-6";

export default function Landing() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-14 sm:space-y-20">
      {/* Hero */}
      <section className="grid items-center gap-8 rounded-2xl bg-[#17302b] px-5 py-10 text-[#f4f6f2] sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-12">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#e8b23a] sm:text-sm">
            For students on slow or costly data
          </p>
          <h1 className="display mt-3 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
            Every lesson, whatever your connection.
          </h1>
          <p className="mt-5 max-w-prose text-base text-[#d5ddd8] sm:text-lg">
            Heavy lecture videos are hard to watch on a weak network. LiteLearn turns one upload into lighter versions that students can actually use.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/lessons" className={`${btn} bg-[#e8b23a] text-[#10201c] hover:bg-[#f0c05a] focus-visible:outline-white`}>
              Browse lessons
            </Link>
            <Link href="/teacher" className={`${btn} border border-[#f4f6f2]/50 hover:bg-white/10 focus-visible:outline-white`}>
              Upload a lesson
            </Link>
          </div>
        </div>

        <figure className="rounded-xl bg-[#f4f6f2] p-5 text-[#10201c] sm:p-6">
          <figcaption className="text-sm font-medium">Same lesson, different sizes</figcaption>
          <div className="mt-4 space-y-4 text-sm">
            {example.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between">
                  <span>{b.label}</span>
                  <span className="font-medium">{b.size}</span>
                </div>
                <div className="mt-1.5 h-3 rounded-full bg-[#17302b]/10">
                  <div className={`h-3 rounded-full ${b.color}`} style={{ width: b.width }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[#3d4f4a]">
            Example only. Real sizes depend on each lesson and appear on every lesson page.
          </p>
        </figure>
      </section>

      {/* How it works */}
      <section aria-labelledby="how">
        <h2 id="how" className="display text-2xl font-semibold sm:text-3xl">How it works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className={card}>
              <span className="display flex h-9 w-9 items-center justify-center rounded-full bg-[#17302b] text-lg text-white">
                {s.n}
              </span>
              <h3 className="display mt-4 text-xl font-medium">{s.title}</h3>
              <p className="mt-1.5 text-[#3d4f4a]">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Choices */}
      <section aria-labelledby="choose">
        <h2 id="choose" className="display text-2xl font-semibold sm:text-3xl">
          Pick what your connection can handle
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((o) => (
            <li key={o.name} className={card}>
              <p className="inline-block rounded-full bg-[#e8b23a]/30 px-2.5 py-0.5 text-xs font-medium">{o.tag}</p>
              <p className="display mt-3 text-xl font-medium">{o.name}</p>
              <p className="mt-1 text-sm text-[#3d4f4a]">{o.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Board photos */}
      <section
        aria-labelledby="board"
        className="grid items-center gap-8 rounded-2xl bg-[#e8b23a]/25 p-5 sm:p-8 md:grid-cols-2 lg:p-10"
      >
        <div>
          <h2 id="board" className="display text-2xl font-semibold sm:text-3xl">
            Board writing stays readable
          </h2>
          <p className="mt-3 max-w-prose">
            Small videos can blur handwriting. So LiteLearn also saves sharp still photos of the board from the lesson. Pair them with the audio and a student gets the whole lesson for a fraction of the data.
          </p>
        </div>

        {/* Decorative chalkboard */}
        <div aria-hidden="true" className="rounded-xl border-4 border-[#a97c3d] bg-[#17302b] p-5 text-[#f4f6f2] shadow-sm sm:p-6">
          <p className="display text-lg sm:text-xl">2x + 3 = 11</p>
          <p className="display mt-2 text-lg opacity-90 sm:text-xl">2x = 8</p>
          <p className="display mt-2 text-lg opacity-90 sm:text-xl">x = 4</p>
          <p className="mt-4 text-xs text-[#d5ddd8]">Sharp photo from the lesson</p>
        </div>
      </section>

      {/* Who it's for */}
      <section aria-labelledby="who">
        <h2 id="who" className="display text-2xl font-semibold sm:text-3xl">Who it&apos;s for</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={card}>
            <h3 className="display text-xl font-medium">Students</h3>
            <p className="mt-1.5 text-[#3d4f4a]">
              Learn on a small data plan or a weak signal, without giving up the lesson.
            </p>
          </div>
          <div className={card}>
            <h3 className="display text-xl font-medium">Teachers and volunteers</h3>
            <p className="mt-1.5 text-[#3d4f4a]">
              Upload once and share one link. No editing, no converting, no extra tools.
            </p>
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="rounded-2xl bg-[#17302b] px-5 py-10 text-center text-[#f4f6f2] sm:px-8 sm:py-14">
        <h2 className="display text-2xl font-semibold sm:text-3xl">See it with your own lesson</h2>
        <p className="mx-auto mt-2 max-w-prose text-[#d5ddd8]">
          Upload a short clip and compare the sizes in about a minute.
        </p>
        <Link href="/teacher" className={`${btn} mt-6 w-full bg-[#e8b23a] text-[#10201c] hover:bg-[#f0c05a] focus-visible:outline-white sm:w-auto`}>
          Upload a lesson
        </Link>
       
      </section>
    </div>
  );
}