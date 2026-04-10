import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Сад Для Вас — интернет-магазин растений и товаров для сада";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a3a0a 0%, #2d5a15 50%, #1f4a0d 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />

        {/* Leaf accent */}
        <div
          style={{
            fontSize: 72,
            marginBottom: 24,
            display: "flex",
          }}
        >
          🌿
        </div>

        {/* Site name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-1px",
            lineHeight: 1.1,
            textAlign: "center",
            display: "flex",
          }}
        >
          Сад Для Вас
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 3,
            background: "rgba(255,255,255,0.4)",
            margin: "24px 0",
            borderRadius: 2,
            display: "flex",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          Интернет-магазин растений и товаров для сада в Беларуси
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
            display: "flex",
          }}
        >
          saddlyavas.by
        </div>
      </div>
    ),
    { ...size },
  );
}
