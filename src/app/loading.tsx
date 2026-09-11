import React from "react";

export default function RootLoading() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-44 bg-slate-900/80 rounded-3xl border border-slate-800/80 p-8 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-slate-800 rounded-lg"></div>
          <div className="h-8 w-2/3 bg-slate-800 rounded-xl"></div>
        </div>
        <div className="h-4 w-1/2 bg-slate-800/60 rounded-lg"></div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-48 bg-slate-900/60 rounded-2xl border border-slate-800/60 p-6 space-y-4"
          >
            <div className="h-6 w-1/3 bg-slate-800 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-800/70 rounded"></div>
              <div className="h-4 w-4/5 bg-slate-800/70 rounded"></div>
            </div>
            <div className="h-8 w-full bg-slate-800/40 rounded-xl mt-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
