import React from 'react';
import { MapPin } from 'lucide-react';

interface PropertyLocationProps {
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  location?: string;
  propertyName?: string;
}

const PropertyLocation: React.FC<PropertyLocationProps> = ({ address, city, state, zipcode, location, propertyName }) => {
  const displayTitle = city || location?.split(',').pop()?.trim() || 'Location';
  const displayAddress = address
    ? `${address}, ${city}, ${state} ${zipcode}`
    : location || '';

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-[#2563EB] rounded-full" />
        <h2 className="font-syne text-2xl text-[#0F172A]">
          Location
        </h2>
      </div>

      {/* Address Card */}
      <div className="bg-white border border-[#E6E0DA] rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[rgba(212,117,91,0.1)] rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="flex-1">
            <h3 className="font-manrope font-medium text-base text-[#0F172A] mb-1">
              {displayTitle}
            </h3>
            <p className="font-manrope font-extralight text-sm text-[#64748B] leading-relaxed">
              {displayAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyLocation;