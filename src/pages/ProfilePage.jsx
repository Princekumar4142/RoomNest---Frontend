import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { bookingApi, paymentApi } from "../api/endpoints";
import { Spinner } from "../components/ui/Primitives";
import { ShieldCheck, Phone, Mail, CreditCard } from "lucide-react";
import { loadRazorpayScript } from "../utils/razorpay";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    bookingApi.mine().then((res) => setBookings(res.data.bookings)).finally(() => setLoading(false));
  }, []);

  async function handlePay(booking) {
    setPayingId(booking._id);
    try {
      const orderRes = await paymentApi.createOrder(booking._id);
      const { orderId, amount, currency, keyId } = orderRes.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Couldn't load the payment window. Check your connection and try again.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name: "RoomNest",
        description: booking.room?.title || "Booking advance",
        handler: async (response) => {
          try {
            await paymentApi.verify({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setBookings((prev) =>
              prev.map((b) => (b._id === booking._id ? { ...b, paymentStatus: "paid" } : b))
            );
            toast.success("Payment successful.");
          } catch {
            toast.error("Payment succeeded but verification failed. Contact support.");
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#101B34" },
      });

      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't start payment.");
    } finally {
      setPayingId(null);
    }
  }

  if (!user) return null;

  return (
    <div className="container-page py-10 max-w-3xl">
      <div className="card p-6 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-paper text-2xl font-semibold">
          {user.name?.[0]?.toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{user.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-ink/60 mt-1">
            <Mail size={13} /> {user.email}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-slate-ink/60 mt-0.5">
            <Phone size={13} /> {user.phone}
          </p>
          {user.isIdentityVerified && (
            <p className="flex items-center gap-1 text-xs text-teal font-medium mt-1.5">
              <ShieldCheck size={13} /> Identity verified
            </p>
          )}
        </div>
      </div>

      <h2 className="font-display text-lg font-semibold text-ink mt-10 mb-4">Your bookings & visits</h2>
      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-ink/60">No bookings yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-ink text-sm">{b.room?.title}</p>
                <p className="text-xs text-slate-ink/60 mt-0.5">
                  {b.type === "visit" ? "Visit" : "Booking"}
                  {b.visitScheduledFor && ` · ${new Date(b.visitScheduledFor).toLocaleString("en-IN")}`}
                  {b.advanceAmount > 0 && ` · Advance ₹${b.advanceAmount.toLocaleString("en-IN")}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold capitalize rounded-full bg-ink/8 px-3 py-1">{b.status}</span>
                {b.paymentStatus === "pending" && b.advanceAmount > 0 && (
                  <button
                    onClick={() => handlePay(b)}
                    disabled={payingId === b._id}
                    className="btn-primary !py-1.5 !px-3 text-xs disabled:opacity-60"
                  >
                    <CreditCard size={13} />
                    {payingId === b._id ? "Starting..." : "Pay advance"}
                  </button>
                )}
                {b.paymentStatus === "paid" && (
                  <span className="text-xs font-semibold text-teal">Paid ✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
