import { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  Loader2,
  GraduationCap,
  Phone,
  MessageSquare,
  Utensils,
  BookOpen,
  Wifi,
  Snowflake,
  ShieldCheck,
  Clock,
  IndianRupee,
} from "lucide-react";
import { roomApi, uploadApi } from "../../api/endpoints";
import toast from "react-hot-toast";

const POPULAR_CAMPUSES = [
  "GEC West Champaran (Kumarbagh)",
  "Kumarbagh Station & College Road",
  "Bettiah Town",
  "Chanpatia",
  "Narkatiaganj",
  "Central University of Himachal Pradesh (CUHP)",
  "Delhi University North Campus",
  "IIT Delhi",
  "Christ University Bangalore",
  "VIT Vellore",
  "Delhi Technological University (DTU)",
  "Symbiosis International University Pune",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  campus: "",
  distanceToCampusKm: "0.5",
  walkingTimeMinutes: "6",
  city: "Delhi",
  area: "",
  address: "",
  landmark: "",
  nearbyCollege: "",
  rent: "",
  deposit: "",
  maintenanceCharge: "0",
  electricityCharge: "Included",
  waterCharge: "Included",
  foodIncluded: true,
  foodType: "Veg",
  foodChargeMonthly: "0",
  isZeroBrokerage: true,
  roomType: "PG",
  sharingType: "2-Sharing",
  occupancy: "Boys",
  furnishing: "Furnished",
  totalBeds: "10",
  availableBeds: "2",
  curfewTime: "10:30 PM",
  noticePeriod: "1 Month",
  contactPerson: "",
  contactPhone: "",
  whatsappNumber: "",
  callingHours: "9:00 AM - 8:00 PM",
  amenities: {
    wifi: true,
    ac: true,
    attachedBathroom: true,
    kitchen: false,
    parking: true,
    petFriendly: false,
    powerBackup: true,
    laundry: true,
    studyTable: true,
    roWater: true,
    cctv: true,
    housekeeping: true,
    refrigerator: true,
    geyser: true,
  },
};

const MAX_IMAGES = 8;
const MAX_FILE_MB = 5;

export default function ListingFormModal({ onClose, onSaved, editingRoom = null }) {
  const isEditing = Boolean(editingRoom);

  const [form, setForm] = useState(() => {
    if (!isEditing) return EMPTY_FORM;
    return {
      title: editingRoom.title || "",
      description: editingRoom.description || "",
      campus: editingRoom.campus || editingRoom.nearbyCollege || "",
      distanceToCampusKm: editingRoom.distanceToCampusKm ?? "0.5",
      walkingTimeMinutes: editingRoom.walkingTimeMinutes ?? "6",
      city: editingRoom.city || "",
      area: editingRoom.area || "",
      address: editingRoom.address || "",
      landmark: editingRoom.landmark || "",
      nearbyCollege: editingRoom.nearbyCollege || "",
      rent: editingRoom.rent ?? "",
      deposit: editingRoom.deposit ?? "",
      maintenanceCharge: editingRoom.maintenanceCharge ?? "0",
      electricityCharge: editingRoom.electricityCharge || "Included",
      waterCharge: editingRoom.waterCharge || "Included",
      foodIncluded: Boolean(editingRoom.foodIncluded),
      foodType: editingRoom.foodType || "None",
      foodChargeMonthly: editingRoom.foodChargeMonthly ?? "0",
      isZeroBrokerage: editingRoom.isZeroBrokerage !== false,
      roomType: editingRoom.roomType || "PG",
      sharingType: editingRoom.sharingType || "2-Sharing",
      occupancy: editingRoom.occupancy || "Boys",
      furnishing: editingRoom.furnishing || "Furnished",
      totalBeds: editingRoom.totalBeds ?? "10",
      availableBeds: editingRoom.availableBeds ?? "2",
      curfewTime: editingRoom.curfewTime || "10:30 PM",
      noticePeriod: editingRoom.noticePeriod || "1 Month",
      contactPerson: editingRoom.contactPerson || "",
      contactPhone: editingRoom.contactPhone || "",
      whatsappNumber: editingRoom.whatsappNumber || "",
      callingHours: editingRoom.callingHours || "9:00 AM - 8:00 PM",
      amenities: { ...EMPTY_FORM.amenities, ...(editingRoom.amenities || {}) },
    };
  });

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
      toast.error("Add at least one photograph of the room or PG.");
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
        distanceToCampusKm: Number(form.distanceToCampusKm) || 0.5,
        walkingTimeMinutes: Number(form.walkingTimeMinutes) || 6,
        totalBeds: Number(form.totalBeds) || 1,
        availableBeds: Number(form.availableBeds) || 1,
        foodChargeMonthly: Number(form.foodChargeMonthly) || 0,
        nearbyCollege: form.campus || form.nearbyCollege,
        images: finalImages,
      };

      if (isEditing) {
        await roomApi.update(editingRoom._id, payload);
        toast.success("Listing updated — submitted for review.");
      } else {
        await roomApi.create(payload);
        toast.success("Listing submitted! Our campus team will verify and approve it shortly.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Owner Listing Portal
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
              {isEditing ? "Edit Property Listing" : "Add Student PG / Room Listing"}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Photographs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Photographs ({images.length}/{MAX_IMAGES})
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {images.map((img, i) => (
                  <div
                    key={img.kind === "existing" ? img.url : img.preview}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
                  >
                    <img
                      src={img.kind === "existing" ? img.url : img.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        Cover Photo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-5 cursor-pointer transition-colors ${
                  dragActive ? "border-teal bg-blue-50/50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <UploadCloud size={22} className="text-slate-400" />
                <p className="text-xs text-slate-700">
                  <span className="font-semibold text-teal">Click to upload</span> or drag and drop photos
                </p>
                <p className="text-[11px] text-slate-400">JPG, PNG or WebP up to 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && addFiles(e.target.files)}
                />
              </div>
            )}
          </div>

          {/* Section 2: Basic Info & Campus Proximity */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <GraduationCap size={15} className="text-teal" />
              Target Campus & Location
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Listing Title</label>
              <input
                required
                placeholder="e.g. Royal Heritage Boys PG — 4 Min Walk to DU North Campus"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="input-field text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target College / Campus</label>
                <input
                  required
                  placeholder="e.g. Delhi University North Campus"
                  value={form.campus}
                  onChange={(e) => update("campus", e.target.value)}
                  className="input-field text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Distance to Campus (km)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 0.5"
                  value={form.distanceToCampusKm}
                  onChange={(e) => update("distanceToCampusKm", e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                <input
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="input-field text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Area / Locality</label>
                <input
                  required
                  placeholder="e.g. Kamla Nagar, Koramangala"
                  value={form.area}
                  onChange={(e) => update("area", e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Complete Address</label>
              <input
                required
                placeholder="Door No, Street name, Landmark"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          {/* Section 3: Room Type, Occupancy & Pricing */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <IndianRupee size={15} className="text-slate-700" />
              Room Details & Transparent Rent
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Property Type</label>
                <select
                  value={form.roomType}
                  onChange={(e) => update("roomType", e.target.value)}
                  className="input-field text-xs"
                >
                  {["PG", "Hostel", "Single Room", "Shared Room", "Flat"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Sharing Type</label>
                <select
                  value={form.sharingType}
                  onChange={(e) => update("sharingType", e.target.value)}
                  className="input-field text-xs"
                >
                  {["Single Room", "2-Sharing", "3-Sharing", "4-Sharing", "Private Flat"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Occupancy</label>
                <select
                  value={form.occupancy}
                  onChange={(e) => update("occupancy", e.target.value)}
                  className="input-field text-xs"
                >
                  {["Boys", "Girls", "Co-ed"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Monthly Rent (₹)</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 8500"
                  value={form.rent}
                  onChange={(e) => update("rent", e.target.value)}
                  className="input-field text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 8500"
                  value={form.deposit}
                  onChange={(e) => update("deposit", e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Electricity Policy</label>
                <select
                  value={form.electricityCharge}
                  onChange={(e) => update("electricityCharge", e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Included">Included in Rent</option>
                  <option value="By Sub-meter">By Sub-meter</option>
                  <option value="Flat ₹500/mo">Flat ₹500/mo</option>
                </select>
              </div>
            </div>

            {/* Food / Mess toggle */}
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.foodIncluded}
                  onChange={(e) => update("foodIncluded", e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <Utensils size={14} className="text-amber-500" />
                3 Meals / Mess Included in Rent
              </label>

              {form.foodIncluded && (
                <select
                  value={form.foodType}
                  onChange={(e) => update("foodType", e.target.value)}
                  className="input-field text-xs !w-auto !py-1"
                >
                  <option value="Veg">Pure Veg Mess</option>
                  <option value="Both">Veg & Non-Veg</option>
                </select>
              )}
            </div>

            {/* Rent Agreement toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.rentAgreementAvailable}
                  onChange={(e) => update("rentAgreementAvailable", e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <ShieldCheck size={14} className="text-teal" />
                Formal Rent Agreement Provided (For student address proof & college submit)
              </label>
            </div>
          </div>

          {/* Section 4: Student Facilities */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Available Facilities & Student Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
              {[
                { key: "wifi", label: "High-Speed Wi-Fi" },
                { key: "ac", label: "Air Conditioner" },
                { key: "attachedBathroom", label: "Attached Bath" },
                { key: "studyTable", label: "Study Desk & Chair" },
                { key: "powerBackup", label: "Power Backup" },
                { key: "laundry", label: "Washing Machine" },
                { key: "roWater", label: "RO Water Dispenser" },
                { key: "cctv", label: "CCTV & Security" },
                { key: "housekeeping", label: "Daily Cleaning" },
                { key: "refrigerator", label: "Refrigerator" },
                { key: "geyser", label: "Hot Water Geyser" },
                { key: "parking", label: "2-Wheeler Parking" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.amenities[key]}
                    onChange={() => toggleAmenity(key)}
                    className="rounded text-teal focus:ring-teal"
                  />
                  <span className="truncate">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 5: Direct Contact Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Phone size={14} className="text-teal" />
              Owner Contact Details (For Students)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Contact Person Name</label>
                <input
                  required
                  placeholder="e.g. Rameshwar Goel"
                  value={form.contactPerson}
                  onChange={(e) => update("contactPerson", e.target.value)}
                  className="input-field text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                <input
                  required
                  placeholder="e.g. 9810234567"
                  value={form.contactPhone}
                  onChange={(e) => update("contactPhone", e.target.value)}
                  className="input-field text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">WhatsApp Number</label>
                <input
                  placeholder="For instant student chat"
                  value={form.whatsappNumber}
                  onChange={(e) => update("whatsappNumber", e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Curfew / Gate Timing</label>
                <select
                  value={form.curfewTime}
                  onChange={(e) => update("curfewTime", e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="No Curfew">No Curfew / 24x7</option>
                  <option value="10:00 PM">10:00 PM</option>
                  <option value="10:30 PM">10:30 PM</option>
                  <option value="11:00 PM">11:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Calling Hours</label>
                <input
                  placeholder="e.g. 9:00 AM - 8:30 PM"
                  value={form.callingHours}
                  onChange={(e) => update("callingHours", e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary text-xs !px-6"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading Photos...
                </>
              ) : saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving Listing...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Publish Verified Listing"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
