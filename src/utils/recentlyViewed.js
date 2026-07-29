const KEY = "roomnest_recently_viewed";
const MAX_ITEMS = 8;

export function recordView(room) {
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
    const filtered = existing.filter((r) => r._id !== room._id);
    const next = [
      { _id: room._id, title: room.title, city: room.city, area: room.area, rent: room.rent, images: room.images, roomType: room.roomType },
      ...filtered,
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing etc.) - fail silently
  }
}

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
