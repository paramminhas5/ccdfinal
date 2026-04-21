// Edit this file to add/edit blog posts. Each post supports a slug, title,
// excerpt, cover image, tag, date, author, and a body (array of paragraph strings
// or simple HTML strings — rendered as paragraphs).

import episode1Poster from "@/assets/episode-1-poster.gif";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  tag: string;
  date: string;
  author: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "best-underground-parties-bangalore-2026",
    title: "The Best Underground Parties in Bangalore (2026 Guide)",
    excerpt:
      "From basements in Indiranagar to warehouses in Whitefield — a working guide to where Bangalore actually dances when the lights go down.",
    cover: episode1Poster,
    tag: "GUIDE",
    date: "JAN 14, 2026",
    author: "The Pack",
    body: [
      "Bangalore's underground scene runs on word of mouth. Most of the best nights in the city aren't on a flyer — they're a screenshot, a forwarded address, a 'come through' from a friend who knows. If you're new to the city, or you've outgrown the same three rooftop bars, this is the working map.",
      "First, the obvious: Cats Can Dance Episodes. We curate 4-6 nights a year, each in a different room, each anchored by a sound system that hits and a lineup that doesn't show up on the algorithm. RSVP at /events — capacity is small on purpose.",
      "Beyond us, the rotation that matters in 2026 includes pop-up nights at unmarked spaces around CBD and South Bangalore, recurring techno hours at a handful of east-side venues, and the occasional warehouse takeover near Whitefield. The crews to watch share a few traits: they don't oversell tickets, they care about the low-end, and they treat the floor like a co-creator, not a customer.",
      "What separates Bangalore from Mumbai or Delhi is intimacy. Our best parties top out at 200-400 people. That's not a limitation — it's the format. A tight room with a real system beats a stadium every time, and Bangalore's promoters have leaned into that for nearly a decade.",
      "Genre-wise, expect a heavy spine of house and techno, with detours into UK garage, breaks, and the occasional left-field ambient afterparty. The city's tastes are catholic — a single night might run from dub techno at 11pm to peak-time acid at 2am to a downtempo cooldown at 4am.",
      "If you want to find these nights without us writing them down: follow the right Instagram accounts, show up early to the listed parties to meet the right people, and never skip an opening set. Half the city's best DJs are warming up at 10pm to a room of twelve.",
      "And when you're ready, check the Cats Can Dance event schedule — we'll see you on the floor.",
      "Related: Read 'Where to Find Electronic Music Events in Bangalore' and 'A Guide to Techno & House Nights in Bangalore'.",
    ],
  },
  {
    slug: "where-to-find-electronic-music-events-bangalore",
    title: "Where to Find Electronic Music Events in Bangalore",
    excerpt:
      "Insider.in, Instagram, word of mouth — the actual sources Bangalore promoters use to fill rooms in 2026.",
    cover: episode1Poster,
    tag: "GUIDE",
    date: "JAN 21, 2026",
    author: "The Pack",
    body: [
      "If you've ever Googled 'electronic music events Bangalore' you've seen the problem: the first page is mostly aggregator listings two months out of date and a few SEO-spam blogs that don't actually go to parties. Here's how the people who do, find out.",
      "Insider.in remains the strongest single ticketing source for paid electronic events in Bangalore — most established promoters list there. RA (Resident Advisor) covers a thinner slice but tends to surface the more international and underground bookings.",
      "Instagram is where the real pulse lives. Follow promoters, not venues. Venues recycle audiences; promoters curate them. A dozen accounts in your saved-stories folder will tell you more about next weekend than any listing site.",
      "Then there are the invite-only nights. These are usually small, free or pay-what-you-want, and announced 24-48 hours before doors via DM. To get on those lists you need to actually show up to the public ones first — proximity is currency.",
      "Cats Can Dance sits in the middle: our Episodes are public RSVPs (so anyone can come), but with controlled capacity (so it never feels like a paid concert). All current nights are at /events. Add yourself to the early-access list to hear about each one before it goes wider.",
      "One more thing: keep an eye on Bangalore's record stores and listening bars. They host more curated electronic events than most clubs, and the crowds skew toward people who actually care about the music.",
      "If you're an artist or venue and want to be listed in our network, head to /for-artists or /for-venues.",
    ],
  },
  {
    slug: "top-event-organisers-india-dance-music",
    title: "Top 10 Event Organisers in India for Dance Music",
    excerpt:
      "From Bangalore to Mumbai to Goa — the independent crews shaping India's dance music scene right now.",
    cover: episode1Poster,
    tag: "FEATURE",
    date: "JAN 28, 2026",
    author: "The Pack",
    body: [
      "India's dance music ecosystem in 2026 isn't built on festivals — it's built on independent organisers running 200-800 capacity nights, every week, in cities across the country. Here are the ones doing the work.",
      "**Bangalore:** Cats Can Dance leads the underground Episode format in Bangalore, focused on cult parties with curated lineups and small rooms. The city also hosts a strong rotation of techno and house promoters running monthly residencies.",
      "**Mumbai:** A handful of South Bombay and Bandra-based crews continue to dominate, anchored around a small set of venues that prioritise sound and design over capacity. The scene is denser than Bangalore but more competitive on door price.",
      "**Delhi/Gurgaon:** The capital's underground has rebuilt steadily over the last three years — heavy on techno, light on house, with a growing afters culture in the western suburbs.",
      "**Goa:** Always its own ecosystem. Year-round outdoor parties and a tight rotation of villa raves keep Goa's reputation as India's electronic music heartland intact, particularly in the November-March window.",
      "**Pune, Hyderabad, Pondicherry:** Smaller scenes but real ones — each has at least one promoter consistently booking lineups that would headline anywhere in the country.",
      "What unites the best operators across cities is the same thing: discipline about capacity, respect for the headliner *and* the openers, and refusal to chase trend genres that don't suit the room.",
      "Cats Can Dance's contribution to the national picture is the Episode format — RSVP-only nights with no flyer marketing, designed to read more as a community gathering than a commercial event. Read more on /about or check upcoming episodes at /events.",
    ],
  },
  {
    slug: "rsvp-culture-bangalore-party-scene",
    title: "RSVP Culture: How Bangalore's Party Scene Works",
    excerpt:
      "Why the best nights in Bangalore aren't sold by the ticket — and what RSVP actually means in 2026.",
    cover: episode1Poster,
    tag: "ESSAY",
    date: "FEB 4, 2026",
    author: "The Pack",
    body: [
      "Walk into the wrong Bangalore club at 1am and you'll find 600 people who paid 1500 rupees to feel nothing. Walk into the right room and you'll find 200 people who replied to an email. The difference is RSVP culture.",
      "RSVP — request, then maybe receive — is how most of the city's best nights run now. You don't buy a ticket. You submit your name, your email, sometimes a sentence on why. The promoter curates a guest list. Doors are tighter than the room. Nothing about it is exclusive in a snobbish way; it's exclusive in the practical sense that a 250-capacity room cannot hold a thousand people without losing the thing that made it worth attending.",
      "Why does this work? Three reasons. One: it lets the promoter shape the room. A floor with the right energy is half the night, and the wrong twenty people can sink it. Two: it puts a small psychological cost on attending — if you replied, you show up. Walk-in tickets get bought and ignored. RSVPs get honoured. Three: it sidesteps the awful Bangalore club economy where the door price doubles by midnight and the bar makes back its margin on overpriced cocktails.",
      "Cats Can Dance has run on RSVP since Episode 01. Free, capacity-limited, name-on-the-door. We've never sold a ticket and we don't intend to. The model isn't anti-commercial — it's pro-room.",
      "If you want in, the RSVP for the next Episode is at /events. If we're full, you go on the next-edition list. We rotate venues so the audience rotates with us — which keeps the room honest.",
      "If you're an artist who wants to play one of these nights, /for-artists has the brief. If you're a venue who wants to host, /for-venues has ours.",
    ],
  },
  {
    slug: "guide-techno-house-nights-bangalore",
    title: "A Guide to Techno & House Nights in Bangalore",
    excerpt:
      "Where the city actually plays techno and house in 2026 — by tempo, by neighbourhood, by what time you should arrive.",
    cover: episode1Poster,
    tag: "GUIDE",
    date: "FEB 11, 2026",
    author: "The Pack",
    body: [
      "Bangalore's techno and house scenes share DJs but rarely share rooms. Here's how the two worlds split across the city in 2026, and how to navigate them.",
      "**House nights** in Bangalore tend to start earlier (10-11pm), live in smaller rooms (150-300 capacity), and lean toward deep, soulful, and disco-tinged selections. The crowd usually skews 25-35, the bar gets used more than the smoking area, and dancing is the default — not the exception.",
      "**Techno nights** push later (11pm-12am doors, peak hour around 2am), occupy bigger rooms when the lineup deserves it, and run a tempo range from 128 BPM dub techno to 145+ BPM peak-time and rave revivals. Crowds are mixed but the regulars are committed — these are the people who will show up to a 4am set on a Tuesday if the booking is right.",
      "Neighbourhoods matter. Indiranagar and the CBD host most of the listening-bar and house-leaning nights. Whitefield and the eastern suburbs are where you'll find the warehouse-style techno parties. Pockets of South Bangalore have started doing genre-fluid takeovers in 2025/26 that defy the geography.",
      "Cats Can Dance Episodes blur the line on purpose — most of our nights run a slow build from house into peak-time techno across the night, with one back-to-back as a centrepiece. We pick rooms that suit the format. Schedule is at /events.",
      "If you want to time it right: arrive when doors open, stay through the opening set, and trust the room's curve. The DJs putting Bangalore on the map didn't get there by playing for the people who showed up at 1:30am.",
    ],
  },
  {
    slug: "behind-the-decks-bangalore-rising-djs",
    title: "Behind the Decks: Bangalore's Rising DJs",
    excerpt:
      "Six artists from Bangalore reshaping how the city sounds at 2am — and where to catch them next.",
    cover: episode1Poster,
    tag: "ARTISTS",
    date: "FEB 18, 2026",
    author: "The Pack",
    body: [
      "The list of DJs you should know in Bangalore in 2026 is longer than it was in 2022. The city has produced a generation of selectors who came up playing opening sets in living rooms and now headline rooms across India. Here's a partial map.",
      "We're not naming names individually in this piece — we'll let the bookings on /events speak. But the archetypes are worth identifying, because they tell you something about where the scene is heading.",
      "**The crate diggers.** Two or three artists in the city are putting out monthly mixes built around records most people in India have never heard. Their sets are educational without ever feeling like a lecture. If you go home wanting to Shazam ten things, you've heard one of them.",
      "**The hybrid live acts.** Not pure DJ sets, not full live shows — a small handful of Bangalore artists are running improvised hardware-and-DJ hybrids that blur the line. These are the most exciting Episodes for us to book.",
      "**The genre fluid headliners.** A few names can credibly close a night that ran from disco to peak-time techno without losing the room. They're rare globally and Bangalore has a couple.",
      "**The openers who deserve headline slots.** Probably the most important category — the artists whose 11pm sets are the secret heart of the scene. Cats Can Dance has built more than one Episode around a 90-minute opener.",
      "If you're an artist who wants to be considered for an Episode, /for-artists has the brief. If you're an attendee who wants to find these acts, the answer is the same as it's always been: show up early.",
    ],
  },
  {
    slug: "inside-episode-01",
    title: "Inside Episode 01: How Bangalore Showed Up",
    excerpt:
      "No flyer, no ads, just a whisper. Here's what happened when Cats Can Dance dropped its first night in Bangalore.",
    cover: episode1Poster,
    tag: "JOURNAL",
    date: "MAY 12, 2025",
    author: "The Pack",
    body: [
      "We didn't print a flyer. We didn't run an ad. We told twenty people the address two hours before doors, and asked them to bring one friend each. By midnight the room was full and the floor was a blur.",
      "Episode 01 was less an event and more a stress test — could a city this loud about its scene actually show up for something brand new, with no headliner, no genre tag, and no promises beyond a sound system that hits? Bangalore answered fast.",
      "The opening b2b ran ninety minutes longer than planned. Nobody noticed. The bar ran out of one specific drink at 1:14am and somebody made a TikTok about it. Two strangers swapped jackets. A cat-eared kid in the back kept yelling 'one more' until we played one more.",
      "We learned three things. One: people are starving for nights that feel like they were made by humans, not algorithms. Two: a tight room beats a big room every time. Three: the cats can, in fact, dance.",
      "Episode 02 is being built right now. Same energy, more space, better low-end. RSVP locks your spot — capacity will be tighter than you think.",
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export const getRelatedPosts = (slug: string, limit = 3) =>
  posts.filter((p) => p.slug !== slug).slice(0, limit);
