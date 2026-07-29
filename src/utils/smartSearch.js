// Lightweight rule-based parser that turns a natural-language query like
// "girls PG under 6000 with wifi near Delhi University" into structured
// search filters. This is NOT an LLM - it's regex/keyword extraction - but it
// covers the common patterns people actually type, with zero API cost or key.

const KNOWN_CITIES = [
  "Delhi", "Bangalore", "Bengaluru", "Mumbai", "Gurgaon", "Gurugram", "Hyderabad",
  "Pune", "Vellore", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Noida", "Lucknow",
];

const ROOM_TYPE_KEYWORDS = [
  { re: /\bpg\b/i, value: "PG" },
  { re: /\bhostel\b/i, value: "Hostel" },
  { re: /\bshared\s*room\b/i, value: "Shared Room" },
  { re: /\bsingle\s*room\b/i, value: "Single Room" },
  { re: /\bflat\b|\bapartment\b/i, value: "Flat" },
];

const OCCUPANCY_KEYWORDS = [
  { re: /\bgirls?\b/i, value: "Girls" },
  { re: /\bboys?\b/i, value: "Boys" },
  { re: /\bfamily\b|\bfamilies\b/i, value: "Family" },
  { re: /\bco-?ed\b/i, value: "Co-ed" },
];

const AMENITY_KEYWORDS = [
  { re: /\bwifi\b/i, key: "wifi" },
  { re: /\bac\b|air\s*condition/i, key: "ac" },
  { re: /\battached\s*bathroom\b/i, key: "attachedBathroom" },
  { re: /\bkitchen\b/i, key: "kitchen" },
  { re: /\bparking\b/i, key: "parking" },
  { re: /pet\s*friendly/i, key: "petFriendly" },
];

export function parseSmartQuery(raw) {
  const text = raw.trim();
  const filters = { amenities: [] };
  let remainder = text;

  // Budget: "under 6000", "below ₹6000", "less than 6k"
  const maxMatch = remainder.match(/(?:under|below|less than|upto|up to)\s*₹?\s*(\d+)(k)?/i);
  if (maxMatch) {
    filters.maxRent = Number(maxMatch[1]) * (maxMatch[2] ? 1000 : 1);
    remainder = remainder.replace(maxMatch[0], "");
  }
  const minMatch = remainder.match(/(?:above|over|more than)\s*₹?\s*(\d+)(k)?/i);
  if (minMatch) {
    filters.minRent = Number(minMatch[1]) * (minMatch[2] ? 1000 : 1);
    remainder = remainder.replace(minMatch[0], "");
  }

  // Verified-only mention
  if (/\bverified\b/i.test(remainder)) {
    filters.verifiedOnly = true;
    remainder = remainder.replace(/\bverified\b/i, "");
  }

  // Room type
  for (const { re, value } of ROOM_TYPE_KEYWORDS) {
    if (re.test(remainder)) {
      filters.roomType = value;
      remainder = remainder.replace(re, "");
      break;
    }
  }

  // Occupancy
  for (const { re, value } of OCCUPANCY_KEYWORDS) {
    if (re.test(remainder)) {
      filters.occupancy = value;
      remainder = remainder.replace(re, "");
      break;
    }
  }

  // Amenities (can match several)
  for (const { re, key } of AMENITY_KEYWORDS) {
    if (re.test(remainder)) {
      filters.amenities.push(key);
      remainder = remainder.replace(re, "");
    }
  }

  // City
  for (const city of KNOWN_CITIES) {
    const re = new RegExp(`\\b${city}\\b`, "i");
    if (re.test(remainder)) {
      filters.city = city === "Bengaluru" ? "Bangalore" : city === "Gurugram" ? "Gurgaon" : city;
      remainder = remainder.replace(re, "");
      break;
    }
  }

  // Whatever's left (after stripping filler words like "near", "with", "for") becomes
  // the free-text search term - useful for colleges, companies, landmarks.
  const cleaned = remainder
    .replace(/\b(near|with|for|rooms?|room|a|an|the|and|in|at)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned) filters.q = cleaned;

  return filters;
}

export function filtersToSearchParams(filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.city) params.set("city", filters.city);
  if (filters.minRent) params.set("minRent", String(filters.minRent));
  if (filters.maxRent) params.set("maxRent", String(filters.maxRent));
  if (filters.roomType) params.set("roomType", filters.roomType);
  if (filters.occupancy) params.set("occupancy", filters.occupancy);
  if (filters.verifiedOnly) params.set("verifiedOnly", "true");
  if (filters.amenities?.length) params.set("amenities", filters.amenities.join(","));
  return params;
}
