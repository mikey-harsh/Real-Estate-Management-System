import React from 'react';

const PropertyCardSkeleton: React.FC = () => (
  <div className="bg-white border border-[#E6E0DA] rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-[340/240] bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-7 w-28 bg-gray-200 rounded" />
      <div className="h-5 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
      <div className="flex gap-4 pb-3">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-9 w-full bg-gray-200 rounded-lg" />
    </div>
  </div>
);

export default PropertyCardSkeleton;
