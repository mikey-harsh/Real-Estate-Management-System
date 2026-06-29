import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FilterSidebar from '../components/properties/FilterSidebar';
import PropertiesHeader from '../components/properties/PropertiesHeader';
import PropertiesGrid from '../components/properties/PropertiesGrid';
import LoadingState from '../components/common/LoadingState';
import PropertyCardSkeleton from '../components/properties/PropertyCardSkeleton';
import { propertiesAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSEO } from '../hooks/useSEO';

export interface Property {
  _id: string;
  title: string;
  location: string;
  price: number;
  image: string[];
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  availability: string;
  description: string;
  amenities: string[];
  phone: string;
}

const PropertiesPage: React.FC = () => {
  useSEO({
    title: 'Properties - Browse Listings',
    description: 'Browse apartments, houses, villas, and more. Filter by location, price, bedrooms, and amenities.',
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [properties, setProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState<{
    location?: string;
    propertyType?: string[];
    availability?: string;
    priceRange?: [number, number];
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
  }>({});

  const { isAuthenticated } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      return;
    }

    try {
      const { data } = await userAPI.getFavorites();
      if (data.success && Array.isArray(data.favorites)) {
        setFavoriteIds(data.favorites.map((fav: any) => fav._id));
      }
    } catch (err: any) {
      console.error('Failed to load favorites:', err);
    }
  }, [isAuthenticated]);

  // Fetch properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await propertiesAPI.getAll();
        if (data.success && data.property) {
          setProperties(data.property);
        }
      } catch (err: any) {
        console.error('Failed to fetch properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Apply filters and sorting
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Filter by location
    if (filters.location) {
      result = result.filter((p) =>
        p.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Filter by property type
    if (filters.propertyType && filters.propertyType.length > 0) {
      result = result.filter((p) =>
        filters.propertyType!.some(t => t.toLowerCase() === p.type.toLowerCase())
      );
    }

    // Filter by availability (rent / buy)
    if (filters.availability) {
      result = result.filter((p) =>
        p.availability.toLowerCase() === filters.availability!.toLowerCase()
      );
    }

    // Filter by price range
    // Slider uses 0–200 scale where each unit = 10 Lakhs (so 200 = ₹20 Cr)
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      const minPrice = min * 1000000;  // slider unit → ₹ (× 10L)
      const maxPrice = max * 1000000;
      result = result.filter((p) => {
        if (p.price < minPrice) return false;
        if (max >= 200) return true; // 200 = no upper cap
        return p.price <= maxPrice;
      });
    }

    // Filter by bedrooms (>= selected)
    if (filters.bedrooms && filters.bedrooms > 0) {
      result = result.filter(p => p.beds >= filters.bedrooms!);
    }

    // Filter by bathrooms (>= selected)
    if (filters.bathrooms && filters.bathrooms > 0) {
      result = result.filter(p => p.baths >= filters.bathrooms!);
    }

    // Filter by amenities (must have all selected)
    if (filters.amenities && filters.amenities.length > 0) {
      result = result.filter(p => 
        filters.amenities!.every(filterAmenity => 
          p.amenities.some(propertyAmenity => 
            propertyAmenity.toLowerCase() === filterAmenity.toLowerCase()
          )
        )
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'beds':
        result.sort((a, b) => b.beds - a.beds);
        break;
      case 'newest':
        // Assuming there is a date field, if not, use _id roughly? Or skip.
        // User asked for "Newest (by date added, default)". 
        // Component doesn't have date. I will try to sort by _id descending (implicit timestamp in Mongo ObjectId)
        result.sort((a, b) => b._id.localeCompare(a._id));
        break;
      case 'featured':
      default:
        // Featured could be a flag, or just default order.
        break;
    }

    return result;
  }, [properties, filters, sortBy]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const handleFavoriteToggle = async (propertyId: string, value: boolean) => {
    try {
      if (value) {
        await userAPI.saveFavorite(propertyId);
      } else {
        await userAPI.removeFavorite(propertyId);
      }
      setFavoriteIds((current) => {
        if (value) {
          return Array.from(new Set([...current, propertyId]));
        }
        return current.filter((id) => id !== propertyId);
      });
    } catch (error) {
      console.error('Unable to update favorite', error);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Sticky Navigation */}
      <Navbar />

      <div className="flex">
        {/* Left Sidebar - Filters */}
        <FilterSidebar onFilterChange={handleFilterChange} />

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Properties Header with Sort and View Controls */}
          <PropertiesHeader
            totalProperties={filteredProperties.length}
            onSortChange={handleSortChange}
            onViewChange={handleViewChange}
          />


          {/* Loading State — skeleton grid */}
          {loading && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <span className="material-icons text-4xl text-[#2563EB] mb-4">error_outline</span>
                <p className="font-manrope text-[#374151] mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#2563EB] text-white font-manrope font-bold px-6 py-2 rounded-lg hover:bg-[#1D4ED8] transition-all"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProperties.length === 0 && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <span className="material-icons text-4xl text-[#9CA3AF] mb-4">search_off</span>
                <p className="font-manrope text-[#374151] mb-2">No properties found</p>
                <p className="font-manrope font-extralight text-sm text-[#6B7280]">Try adjusting your filters</p>
              </div>
            </div>
          )}

          {/* Properties Grid */}
          {!loading && !error && filteredProperties.length > 0 && (
            <PropertiesGrid
              properties={filteredProperties}
              viewMode={viewMode}
              favoriteIds={favoriteIds}
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PropertiesPage;
