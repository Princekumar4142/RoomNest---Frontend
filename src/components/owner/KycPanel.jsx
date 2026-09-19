import { useState, useRef } from "react";
import { ShieldCheck, Clock, XCircle, ShieldQuestion, UploadCloud, Loader2 } from "lucide-react";
import { authApi, uploadApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const STATUS_META = {
  verified: { label: "Verified", icon: ShieldCheck, className: "text-teal bg-teal/10" },
  pending: { label: "Pending review", icon: Clock, className: "text-seal-dark bg-seal-light/30" },
  rejected: { label: "Rejected — please resubmit", icon: XCircle, className: "text-red-600 bg-red-50" },
  unverified: { label: "Not submitted yet", icon: ShieldQuestion, className: "text-slate-ink/60 bg-ink/6" },
};

export default function KycPanel() {
  const { user, setUser } = useAuth();
  const [aadhaarOrPan, setAadhaarOrPan] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const status = user?.ownerVerification?.status || "unverified";
  const meta = STATUS_META[status];
  const canSubmit = status === "unverified" || status === "rejected";

  function handleFile(f) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Please upload an image (photo/scan of your ID).");
    if (f.size > 5 * 1024 * 1024) return toast.error("File must be smaller than 5MB.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return toast.error("Upload a photo of your Aadhaar or PAN card.");
    if (!aadhaarOrPan.trim()) return toast.error("Enter your Aadhaar or PAN number.");

    setBusy(true);
    try {
      const uploadRes = await uploadApi.images([file]);
      const documentUrl = uploadRes.data.urls[0];
      const res = await authApi.submitKyc({ aadhaarOrPan: aadhaarOrPan.trim(), documentUrl });
      setUser(res.data.user);
      toast.success("Submitted — an admin will review it shortly.");
      setFile(null);
      setPreview(null);
      setAadhaarOrPan("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't submit KYC.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold w-fit mb-5 ${meta.className}`}>
        <meta.icon size={14} />
        {meta.label}
      </div>

      {!canSubmit ? (
        <p className="text-sm text-slate-ink/60">
          {status === "pending"
            ? "Your document is under review. This usually takes 1-2 business days."
            : "Your identity is verified. Renters will see a \"Verified owner\" badge on your listings."}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Aadhaar or PAN number"
            value={aadhaarOrPan}
            onChange={(e) => setAadhaarOrPan(e.target.value)}
            className="input-field"
          />

          {preview ? (
            <div className="relative">
              <img src={preview} alt="Document preview" className="w-full max-h-56 object-cover rounded-xl border border-ink/10" />
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 rounded-full bg-ink/70 text-paper text-xs px-2 py-1"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink/15 hover:border-ink/30 py-8 cursor-pointer"
            >
              <UploadCloud size={22} className="text-slate-ink/40" />
              <p className="text-sm text-ink/70"><span className="font-medium text-teal">Upload</span> a clear photo of your ID</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          )}

          <p className="text-xs text-slate-ink/45">
            Your document is only visible to RoomNest admins for verification purposes.
          </p>

          <button disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit for verification"}
          </button>
        </form>
      )}
    </div>
  );
}
