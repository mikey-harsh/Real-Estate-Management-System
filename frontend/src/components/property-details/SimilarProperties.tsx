import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';

interface SimilarProp {
  _id: string;
  title: string;
  location: string;
  price: number;
  image: string[];
  beds: number;
  baths: number;
  sqft: number;
  type: string;
}

interface SimilarPropertiesProps {
  currentId: string;
  city: string;
}

const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ currentId, city }) => {
  const [properties, setProperties] = useState<SimilarProp[]>([]);

  useEffect(() => {
    propertiesAPI.getAll().then(({ data }) => {
      if (data.success && data.property) {
        const similar = (data.property as SimilarProp[])
          .filter(p => p._id !== currentId && p.location.toLowerCase().includes(city.toLowerCase()))
          .slice(0, 3);
        setProperties(similar);
      }
    }).catch(() => {});
  }, [currentId, city]);

  if (properties.length === 0) return null;

  return (
    <section className="bg-white py-12 border-t border-[#E6E0DA]">
      <div className="max-w-[1280px] mx-auto px-8">
        <h2 className="font-syne font-bold text-2xl text-[#221410] mb-6">Similar Properties in {city}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map(p => (
            <Link key={p._id} to={`/property/${p._id}`} className="block group">
              <div className="bg-white border border-[#E6E0DA] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-[340/220] overflow-hidden">
                  <img
                    src={p.image?.[0] || 'https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?w=600'}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="font-space-mono font-bold text-lg text-[#2563EB]">{formatPrice(p.price)}</p>
                  <h3 className="font-syne text-base text-[#221410] mb-1 line-clamp-1">{p.title}</h3>
                  <p className="font-manrope text-xs text-[#6B7280] flex items-center gap-1">
                    <span className="material-icons text-sm">location_on</span>
                    {p.location}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-[#6B7280] font-manrope">
                    <span>{p.beds} Beds</span>
                    <span>·</span>
                    <span>{p.baths} Baths</span>
                    <span>·</span>
                    <span>{p.sqft.toLocaleString()} sqft</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimilarProperties;
