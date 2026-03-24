import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* Left mind */}
        <circle cx="8" cy="22" r="5" fill="#2563eb" />
        {/* Right mind */}
        <circle cx="24" cy="22" r="5" fill="#2563eb" />
        {/* Bridge arc */}
        <path
          d="M3 22 Q16 4 29 22"
          stroke="#2563eb"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    { ...size }
  );
}
