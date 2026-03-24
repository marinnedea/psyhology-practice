"use client";

import { useState } from "react";

type Availability = {
  id: string;
  psychologistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type Props = {
  availabilities: Availability[];
};

const DAYS = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
];

type DayState = {
  isActive: boolean;
  startTime: string;
  endTime: string;
};

function buildInitialState(availabilities: Availability[]): Record<number, DayState> {
  const state: Record<number, DayState> = {};
  for (const day of DAYS) {
    const existing = availabilities.find((a) => a.dayOfWeek === day.value);
    state[day.value] = {
      isActive: existing?.isActive ?? false,
      startTime: existing?.startTime ?? "09:00",
      endTime: existing?.endTime ?? "17:00",
    };
  }
  return state;
}

export default function AvailabilityForm({ availabilities }: Props) {
  const [days, setDays] = useState<Record<number, DayState>>(
    buildInitialState(availabilities)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleDay(dayOfWeek: number) {
    setDays((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], isActive: !prev[dayOfWeek].isActive },
    }));
  }

  function setTime(dayOfWeek: number, field: "startTime" | "endTime", value: string) {
    setDays((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], [field]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = DAYS.map((day) => ({
      dayOfWeek: day.value,
      startTime: days[day.value].startTime,
      endTime: days[day.value].endTime,
      isActive: days[day.value].isActive,
    }));

    try {
      const res = await fetch("/api/psychologist/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save availability.");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Availability saved successfully.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 text-sm">
          <div className="px-4 py-3 bg-gray-50 font-medium text-gray-600 border-b border-gray-200">
            Day
          </div>
          <div className="px-4 py-3 bg-gray-50 font-medium text-gray-600 border-b border-gray-200 text-center">
            Active
          </div>
          <div className="px-4 py-3 bg-gray-50 font-medium text-gray-600 border-b border-gray-200">
            Start
          </div>
          <div className="px-4 py-3 bg-gray-50 font-medium text-gray-600 border-b border-gray-200">
            End
          </div>

          {DAYS.map((day, i) => {
            const state = days[day.value];
            const isLast = i === DAYS.length - 1;
            return (
              <>
                <div
                  key={`label-${day.value}`}
                  className={`px-4 py-3 flex items-center font-medium text-gray-800 ${!isLast ? "border-b border-gray-100" : ""}`}
                >
                  {day.label}
                </div>
                <div
                  key={`toggle-${day.value}`}
                  className={`px-4 py-3 flex items-center justify-center ${!isLast ? "border-b border-gray-100" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={state.isActive}
                    onChange={() => toggleDay(day.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    aria-label={`Enable ${day.label}`}
                  />
                </div>
                <div
                  key={`start-${day.value}`}
                  className={`px-4 py-3 flex items-center ${!isLast ? "border-b border-gray-100" : ""}`}
                >
                  <input
                    type="time"
                    value={state.startTime}
                    onChange={(e) => setTime(day.value, "startTime", e.target.value)}
                    disabled={!state.isActive}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div
                  key={`end-${day.value}`}
                  className={`px-4 py-3 flex items-center ${!isLast ? "border-b border-gray-100" : ""}`}
                >
                  <input
                    type="time"
                    value={state.endTime}
                    onChange={(e) => setTime(day.value, "endTime", e.target.value)}
                    disabled={!state.isActive}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Availability"}
        </button>
      </div>
    </form>
  );
}
