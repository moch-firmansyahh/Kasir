import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cemal Cemul",
    short_name: "Cemal Cemul",
    description: "Aplikasi kasir dan layar dapur untuk Cemal Cemul",
    start_url: "/kasir",
    display: "standalone",
    background_color: "#FBF1E1",
    theme_color: "#F28A26",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
