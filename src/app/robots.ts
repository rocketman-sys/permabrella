import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/login", "/register", "/forgot-password", "/reset-password", "/*/new"] }, sitemap: `${SITE_ORIGIN}/sitemap.xml` };
}
