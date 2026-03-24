"use client";

import { useState, KeyboardEvent } from "react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: unknown;
  duration: number;
  isActive: boolean;
  sortOrder: number;
};

type PsychologistServiceWithService = {
  id: string;
  psychologistId: string;
  serviceId: string;
  customPrice: unknown;
  service: Service;
};

type Profile = {
  id: string;
  userId: string;
  bio: string | null;
  location: string | null;
  phone: string | null;
  specialties: string[];
  studies: string | null;
  qualifications: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  psychologistServices: PsychologistServiceWithService[];
} | null;

type Props = {
  profile: Profile;
  allServices: Service[];
};

type ServiceToggle = {
  enabled: boolean;
  customPrice: string;
};

export default function ProfileForm({ profile, allServices }: Props) {
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [specialties, setSpecialties] = useState<string[]>(
    profile?.specialties ?? []
  );
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [studies, setStudies] = useState(profile?.studies ?? "");
  const [qualifications, setQualifications] = useState(
    profile?.qualifications ?? ""
  );
  const [websiteUrl, setWebsiteUrl] = useState(profile?.websiteUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(profile?.facebookUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(
    profile?.instagramUrl ?? ""
  );

  const initialServiceToggles: Record<string, ServiceToggle> = {};
  for (const svc of allServices) {
    const existing = profile?.psychologistServices.find(
      (ps) => ps.serviceId === svc.id
    );
    initialServiceToggles[svc.id] = {
      enabled: !!existing,
      customPrice: existing?.customPrice
        ? String(existing.customPrice)
        : "",
    };
  }
  const [serviceToggles, setServiceToggles] = useState<
    Record<string, ServiceToggle>
  >(initialServiceToggles);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSpecialtyKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = specialtyInput.trim();
      if (trimmed && !specialties.includes(trimmed)) {
        setSpecialties([...specialties, trimmed]);
      }
      setSpecialtyInput("");
    }
  }

  function removeSpecialty(tag: string) {
    setSpecialties(specialties.filter((s) => s !== tag));
  }

  function toggleService(serviceId: string) {
    setServiceToggles((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        enabled: !prev[serviceId].enabled,
      },
    }));
  }

  function setCustomPrice(serviceId: string, price: string) {
    setServiceToggles((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], customPrice: price },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const services = Object.entries(serviceToggles)
      .filter(([, v]) => v.enabled)
      .map(([serviceId, v]) => ({
        serviceId,
        customPrice: v.customPrice ? parseFloat(v.customPrice) : null,
      }));

    try {
      const res = await fetch("/api/psychologist/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          location,
          phone,
          specialties,
          studies,
          qualifications,
          websiteUrl,
          linkedinUrl,
          facebookUrl,
          instagramUrl,
          services,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save profile.");
      } else {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Profile saved successfully.
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            placeholder="Tell clients about yourself..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="City, Country"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="+1 555 000 0000"
          />
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Specialties</h2>
        <p className="text-xs text-gray-500">
          Type a specialty and press Enter or comma to add it.
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {specialties.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeSpecialty(tag)}
                className="text-indigo-500 hover:text-indigo-700 font-bold leading-none"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={specialtyInput}
          onChange={(e) => setSpecialtyInput(e.target.value)}
          onKeyDown={handleSpecialtyKeyDown}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="e.g. Anxiety, Depression..."
        />
      </div>

      {/* Studies & Qualifications */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Education &amp; Credentials</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Studies
          </label>
          <textarea
            value={studies}
            onChange={(e) => setStudies(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            placeholder="List your educational background..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qualifications
          </label>
          <textarea
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            placeholder="Certifications, licenses, awards..."
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Social Links</h2>
        {[
          { label: "Website", value: websiteUrl, setter: setWebsiteUrl, placeholder: "https://yourwebsite.com" },
          { label: "LinkedIn", value: linkedinUrl, setter: setLinkedinUrl, placeholder: "https://linkedin.com/in/..." },
          { label: "Facebook", value: facebookUrl, setter: setFacebookUrl, placeholder: "https://facebook.com/..." },
          { label: "Instagram", value: instagramUrl, setter: setInstagramUrl, placeholder: "https://instagram.com/..." },
        ].map(({ label, value, setter, placeholder }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              type="url"
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      {/* Services */}
      {allServices.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Services Offered</h2>
          <p className="text-xs text-gray-500">
            Toggle which services you offer. Optionally set a custom price to
            override the platform default.
          </p>
          <div className="space-y-3">
            {allServices.map((svc) => {
              const toggle = serviceToggles[svc.id];
              return (
                <div
                  key={svc.id}
                  className="flex items-start gap-4 p-3 border border-gray-100 rounded-lg"
                >
                  <input
                    type="checkbox"
                    id={`svc-${svc.id}`}
                    checked={toggle?.enabled ?? false}
                    onChange={() => toggleService(svc.id)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`svc-${svc.id}`}
                      className="text-sm font-medium text-gray-800 cursor-pointer"
                    >
                      {svc.name}
                    </label>
                    {svc.description && (
                      <p className="text-xs text-gray-500">{svc.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      Platform price: ${String(svc.price)} · {svc.duration} min
                    </p>
                  </div>
                  {toggle?.enabled && (
                    <div className="w-32">
                      <label className="block text-xs text-gray-500 mb-1">
                        Custom price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={toggle.customPrice}
                        onChange={(e) => setCustomPrice(svc.id, e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Optional"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
