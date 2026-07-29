import { useState, useRef } from "react";
import { X, UploadCloud, Loader2 } from "lucide-react";
import { roomApi, uploadApi } from "../../api/endpoints";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  title: "",
  description: "",
  city: "",
  area: "",
  address: "",
  landmark: "",
  rent: "",
  deposit: "",
  maintenanceCharge: "",
  roomType: "PG",
  occupancy: "Co-ed",
  furnishing: "Semi Furnished",
  amenities: { wifi: false, ac: false, attachedBathroom: false, kitchen: false, parking: false, petFriendly: false },
};

const MAX_IMAGES = 8;
const MAX_FILE_MB = 5;

// `editingRoom` (optional): if passed, the modal edits that listing instead of creating a new one.
export default function ListingFormModal({ onClose, onSaved, editingRoom = null }) {
  const isEditing = Boolean(editingRoom);

  const [form, setForm] = useState(() =>
    isEditing
      ? {
          title: editingRoom.title || "",
          description: editingRoom.description || "",
          city: editingRoom.city || "",
          area: editingRoom.area || "",
          address: editingRoom.address || "",
          landmark: editingRoom.landmark || "",
          rent: editingRoom.rent ?? "",
          deposit: editingRoom.deposit ?? "",
          maintenanceCharge: editingRoom.maintenanceCharge ?? "",
          roomType: editingRoom.roomType || "PG",
          occupancy: editingRoom.occupancy || "Co-ed",
          furnishing: editingRoom.furnishing || "Semi Furnished",
          amenities: { ...EMPTY_FORM.amenities, ...(editingRoom.amenities || {}) },
        }
      : EMPTY_FORM
  );

  // Unified image list: { kind: "existing", url } for already-uploaded images,
  // or { kind: "file", file, preview } for newly selected ones not yet uploaded.
  const [images, setImages] = useState(() =>
    isEditing ? (editingRoom.images || []).map((url) => ({ kind: "existing", url })) : []
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleAmenity(key) {
    setForm((f) => ({ ...f, amenities: { ...f.amenities, [key]: !f.amenities[key] } }));
  }

  function addFiles(fileList) {
    const incoming = Array.from(fileList);
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`You can have up to ${MAX_IMAGES} images.`);
      return;
    }

    const valid = [];
    for (const file of incoming.slice(0, room)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} isn't an image.`);
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${MAX_FILE_MB}MB.`);
        continue;
      }
      valid.push({ kind: "file", file, preview: URL.createObjectURL(file) });
    }
    if (valid.length === 0) return;

    setImages((prev) => [...prev, ...valid]);
  }

  function removeImage(index) {
    setImages((prev) => {
      const target = prev[index];
      if (target.kind === "file") URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Add at least one photo of the room.");
      return;
    }

    const newFiles = images.filter((img) => img.kind === "file").map((img) => img.file);
    let uploadedUrls = [];

    if (newFiles.length > 0) {
      setUploading(true);
      try {
        const res = await uploadApi.images(newFiles);
        uploadedUrls = res.data.urls;
      } catch (err) {
        toast.error(err.response?.data?.message || "Image upload failed.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // Re-assemble the final image list in the same order shown to the user,
    // swapping newly-uploaded files for their returned URLs.
    let uploadIndex = 0;
    const finalImages = images.map((img) =>
      img.kind === "existing" ? img.url : uploadedUrls[uploadIndex++]
    );

    setSaving(true);
    try {
      const payload = {
        ...form,
        rent: Number(form.rent),
        deposit: Number(form.deposit) || 0,
        maintenanceCharge: Number(form.maintenanceCharge) || 0,
        images: finalImages,
      };

      if (isEditing) {
        await roomApi.update(editingRoom._id, payload);
        toast.success("Listing updated — it will be re-reviewed before going live.");
      } else {
        await roomApi.create(payload);
        toast.success("Listing submitted for verification.");
      }

      images.forEach((img) => img.kind === "file" && URL.revokeObjectURL(img.preview));
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save listing.");
    } finally {
      setSaving(false);
    }
  }

  const busy = uploading || saving;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/40" onClick={!busy ? onClose : undefined} />
      <div className="relative z-10 w-full sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-paper p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-semibold text-ink">
            {isEditing ? "Edit listing" : "List a new property"}
          </h3>
          <button onClick={onClose} disabled={busy}><X size={20} /></button>
        </div>

        {isEditing && (
          <p className="mb-4 text-xs text-seal-dark bg-seal-light/20 rounded-lg px-3 py-2">
            Editing a listing sends it back for admin re-verification before it's visible to renters again.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo uploader */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-ink/50 mb-2">
              Photos ({images.length}/{MAX_IMAGES})
            </p>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {images.map((img, i) => (
                  <div key={img.kind === "existing" ? img.url : img.preview} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={img.kind === "existing" ? img.url : img.preview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-paper opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-ink/70 px-1.5 py-0.5 text-[9px] font-medium text-paper">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-6 cursor-pointer transition-colors ${
                  dragActive ? "border-teal bg-teal/5" : "border-ink/15 hover:border-ink/30"
                }`}
              >
                <UploadCloud size={22} className="text-slate-ink/40" />
                <p className="text-sm text-ink/70">
                  <span className="font-medium text-teal">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-ink/45">JPG, PNG or WEBP, up to {MAX_FILE_MB}MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && addFiles(e.target.files)}
                />
              </div>
            )}
          </div>

          <input required placeholder="Listing title" value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field" />
          <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field" />

          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} className="input-field" />
            <input required placeholder="Area" value={form.area} onChange={(e) => update("area", e.target.value)} className="input-field" />
          </div>
          <input required placeholder="Full address" value={form.address} onChange={(e) => update("address", e.target.value)} className="input-field" />
          <input placeholder="Landmark (optional)" value={form.landmark} onChange={(e) => update("landmark", e.target.value)} className="input-field" />

          <div className="grid grid-cols-3 gap-3">
            <input required type="number" placeholder="Rent ₹" value={form.rent} onChange={(e) => update("rent", e.target.value)} className="input-field" />
            <input type="number" placeholder="Deposit ₹" value={form.deposit} onChange={(e) => update("deposit", e.target.value)} className="input-field" />
            <input type="number" placeholder="Maintenance ₹" value={form.maintenanceCharge} onChange={(e) => update("maintenanceCharge", e.target.value)} className="input-field" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <select value={form.roomType} onChange={(e) => update("roomType", e.target.value)} className="input-field">
              {["Single Room", "Shared Room", "PG", "Hostel", "Flat"].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={form.occupancy} onChange={(e) => update("occupancy", e.target.value)} className="input-field">
              {["Boys", "Girls", "Family", "Co-ed"].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={form.furnishing} onChange={(e) => update("furnishing", e.target.value)} className="input-field">
              {["Furnished", "Semi Furnished", "Unfurnished"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-ink/50 mb-2">Amenities</p>
            <div className="flex flex-wrap gap-3">
              {Object.keys(form.amenities).map((key) => (
                <label key={key} className="flex items-center gap-1.5 text-sm text-ink/80">
                  <input type="checkbox" checked={form.amenities[key]} onChange={() => toggleAmenity(key)} className="rounded border-ink/30 text-teal focus:ring-teal" />
                  {key}
                </label>
              ))}
            </div>
          </div>

          <button disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {uploading ? (
              <><Loader2 size={16} className="animate-spin" /> Uploading photos...</>
            ) : saving ? (
              "Saving listing..."
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Submit for verification"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
