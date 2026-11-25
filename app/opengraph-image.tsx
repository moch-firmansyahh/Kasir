import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Cemal Cemul — Aplikasi Kasir dan Layar Dapur";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function loadLogoDataUri(): Promise<string | null> {
  try {
    const logoPath = path.join(process.cwd(), "public", "Logo_cemal_cemul.png");
    const buffer = await readFile(logoPath);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const logoSrc = await loadLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FBF1E1",
          padding: 48,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 48,
            backgroundColor: "#FFFFFF",
            borderRadius: 36,
            border: "3px solid #E3D3B8",
            padding: "48px 64px",
          }}
        >
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt="Logo Cemal Cemul"
              width={230}
              height={230}
              style={{
                width: 230,
                height: 230,
                borderRadius: 115,
                objectFit: "contain",
              }}
            />
          ) : null}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 16,
              maxWidth: 680,
            }}
          >
            <div
              style={{
                display: "flex",
                backgroundColor: "#F28A26",
                color: "#4A2B21",
                fontSize: 22,
                fontWeight: 700,
                padding: "10px 22px",
                borderRadius: 999,
              }}
            >
              Kasir & Layar Dapur
            </div>

            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: "#4A2B21",
                lineHeight: 1.05,
                letterSpacing: -1,
              }}
            >
              Cemal Cemul
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 500,
                color: "#8A6A5C",
                lineHeight: 1.35,
              }}
            >
              Pencatatan pesanan, hitung otomatis, dan antrean dapur realtime.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
