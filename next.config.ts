import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* add i.discogs.com */
  images: {
    domains: ["i.discogs.com", "st.discogs.com"],
  },
};

export default nextConfig;
