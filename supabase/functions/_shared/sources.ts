// Refreshed 2026 source list for India electronic + culture curation.
// Single source of truth — import from here in curate-events / scheduled-curate.

export const AGGREGATORS = [
  "insider",       // insider.in — still largest
  "district",      // district.in (Zomato) — biggest 2025 growth
  "skillboxes",    // skillbox — indie + electronic
  "sortmyscene",   // sortmyscene — smaller but active
  "highape",       // mostly mainstream, low priority
  "bookmyshow",    // low signal:noise
  "goingout",      // going-out.in — 18 cities, 4800+ venues, structured
  "vybeful",       // venue-first directory
] as const;

// Verified active 2025–26 (sites/IG confirmed)
export const PROMOTERS = [
  { name: "Bhavishyavani Future Soundz", city: "Mumbai", url: "https://bhavishyavanifuturesoundz.com" },
  { name: "Regenerate Music", city: "Mumbai", url: "https://regeneratemusic.co" },
  { name: "Redroom Sessions", city: "Bangalore", url: "https://redroomsessions.com" },
  { name: "Mono Culture", city: "Multi", url: "https://monoculture.in" },
  { name: "Danza", city: "Delhi", url: "https://danza.net.in" },
  { name: "Hypervibez", city: "Multi", url: "https://hypervibez.net" },
  { name: "Cabal Bombay", city: "Mumbai", url: "https://cabalbombay.com" },
  { name: "Wild City", city: "Multi", url: "https://wildcity.com" },
  { name: "Boxout.fm", city: "Delhi", url: "https://boxout.fm" },
  { name: "Krunk", city: "Multi", url: "https://krunk.in" },
  { name: "Submerge", city: "Multi", url: "https://submerge.in" },
];

export const VENUES = {
  bangalore: ["Fandom at Gilly's", "The Bflat", "Le Rock", "Permit Room", "Loft38", "Take 5", "BYG Brewski"],
  mumbai: ["antiSOCIAL Lower Parel", "Bonobo", "The Quarter", "AntiSOCIAL Khar", "Famous Studios", "The Daily Bar"],
  delhi: ["Depot48", "Auro Kitchen & Bar", "Summer House Café", "Roar", "PCO", "Piano Man Jazz Club"],
  goa: ["Hilltop", "Soro", "SinQ"],
  pune: ["High Spirits", "The Daily All Day"],
  hyderabad: ["Heart Cup Coffee", "Prism"],
};

export const CULTURE_SOURCES = [
  { name: "Homegrown", url: "https://homegrown.co.in/tag/events", category: "culture" },
  { name: "Platform Magazine", url: "https://platform-mag.com", category: "design" },
  { name: "Little Black Book", url: "https://lbb.in", category: "city" },
  { name: "Khoj Studios", url: "https://khojstudios.org", category: "art" },
  { name: "G5A", url: "https://g5afoundation.org", category: "art" },
  { name: "Method Gallery", url: "https://methodindia.com", category: "art" },
];

// Closed / pivoted — explicitly exclude
export const REMOVED = [
  "Blue Frog Mumbai", "Kitty Su (most outposts)", "Café Mojo (most outposts)",
  "Hard Rock Café Bangalore Lavelle Rd", "Paytm Insider standalone",
];

export const CITIES = ["bangalore", "mumbai", "delhi", "goa", "pune", "hyderabad"] as const;
