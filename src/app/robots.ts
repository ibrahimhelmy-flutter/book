import { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Crawlers only read robots.txt at a host's root, so this takes effect once the site is served from
 * its own domain (not under github.io/book). Pages that shouldn't be indexed use a robots meta tag.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
