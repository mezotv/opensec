import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpenSec",
    short_name: "OpenSec",
    description: "Donated AI security reviews for open source GitHub repositories.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
  };
}
