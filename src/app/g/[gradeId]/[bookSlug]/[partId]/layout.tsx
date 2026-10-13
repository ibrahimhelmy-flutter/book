import React from "react";
import { getAcronyms, requirePart, type PartRouteParams } from "@/content";
import { PartProvider } from "@/components/layout/PartProvider";
import { Sidebar } from "@/components/layout/Sidebar";

interface Props {
  children: React.ReactNode;
  params: Promise<PartRouteParams>;
}

/** Every page of a book part gets its light manifest (TOC, stats) and acronyms through PartProvider. */
export default async function PartLayout({ children, params }: Props) {
  const manifest = requirePart(await params);

  return (
    <PartProvider manifest={manifest} acronyms={getAcronyms(manifest.key)}>
      <div className="flex-1 flex w-full">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      </div>
    </PartProvider>
  );
}
