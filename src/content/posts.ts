// Edit this file to add/edit blog posts. Each post supports a slug, title,
// excerpt, cover image, tag, date, author, and a body (array of paragraph strings
// or simple HTML strings — rendered as paragraphs).

import episode1Poster from "@/assets/episode-1-poster.png";

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
