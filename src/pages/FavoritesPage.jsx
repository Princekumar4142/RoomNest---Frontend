import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartOff } from "lucide-react";
import { favoriteApi } from "../api/endpoints";
import RoomCard from "../components/room/RoomCard";
import { Spinner } from "../components/ui/Primitives";
import toast from "react-hot-toast";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoriteApi
      .list()
      .then((res) => setFavorites(res.data.favorites))
      .finally(() => setLoading(false));
  }, []);

  async function removeFavorite(roomId) {
    try {
      await favoriteApi.remove(roomId);
      setFavorites((prev) => prev.filter((r) => r._id !== roomId));
    } catch {
      toast.error("Couldn't remove from favorites.");
    }
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Your favorites</h1>
      <p className="text-sm text-slate-ink/60 mt-1">Rooms you've saved to compare later.</p>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-24">
          <HeartOff className="mx-auto text-ink/20" size={40} />
          <p className="font-display text-lg text-ink mt-4">No favorites yet.</p>
          <p className="text-sm text-slate-ink/60 mt-1 mb-6">Tap the heart icon on any room to save it here.</p>
          <Link to="/search" className="btn-primary inline-flex">Browse rooms</Link>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((room) => (
            <RoomCard key={room._id} room={room} isFavorite onToggleFavorite={removeFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
