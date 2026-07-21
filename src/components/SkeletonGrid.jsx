import React from 'react';

export default function SkeletonGrid({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-video skeleton rounded-2xl" />
          <div className="pt-3 flex gap-3">
            <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 skeleton rounded w-3/4" />
              <div className="h-3 skeleton rounded w-1/2" />
              <div className="h-2.5 skeleton rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}