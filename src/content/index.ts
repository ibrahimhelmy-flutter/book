/**
 * Server-only content API. Import from server components (page.tsx / layout.tsx / sitemap.ts) and
 * pass only the data a client component renders as props.
 */
import "server-only";

export * from "./reader";
export * from "./paths";
export * from "./route";
