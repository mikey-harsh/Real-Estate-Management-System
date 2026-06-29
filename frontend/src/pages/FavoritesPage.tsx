import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PropertiesGrid from '../components/properties/PropertiesGrid';
import LoadingState from '../components/common/LoadingState';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSEO } from '../hooks/useSEO';

interface Property {
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

const FavoritesPage: React.FC = () => {
  useSEO({
    title: 'Saved Properties',
    description: 'View and manage your saved properties in one place.',
  });

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin', { replace: true });
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const { data } = await userAPI.getFavorites();
        if (data.success && Array.isArray(data.favorites)) {
          setFavorites(data.favorites);
        } else {
          setFavorites([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch saved properties:', err);
        setError('Unable to load saved properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const handleFavoriteToggle = async (propertyId: string, value: boolean) => {
    try {
      if (!value) {
        await userAPI.removeFavorite(propertyId);
        setFavorites((current) => current.filter((property) => property._id !== propertyId));
      }
    } catch (error) {
      console.error('Unable to update saved property', error);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-8 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-fraunces font-bold text-[#111827] mb-2">Saved Properties</h1>
          <p className="text-[#6B7280] font-manrope text-sm">
            Your saved homes and investment opportunities are stored here so you can revisit them any time.
          </p>
        </div>

        {loading && <LoadingState message="Loading saved properties..." />}

        {error && !loading && (
          <div className="rounded-3xl border border-[#E6E0DA] bg-[#FEF3C7] p-8 text-[#92400E]">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-icons text-5xl text-[#2563EB] mb-6">favorite_border</span>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">No saved properties yet</h2>
            <p className="text-[#6B7280] font-manrope text-sm mb-6">Browse listings and tap the heart icon to save properties for later.</p>
            <button
              onClick={() => navigate('/properties')}
              className="bg-[#2563EB] text-white font-manrope font-bold px-6 py-3 rounded-lg hover:bg-[#1D4ED8] transition-all"
            >
              Browse Properties
            </button>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <PropertiesGrid
            properties={favorites}
            favoriteIds={favorites.map((property) => property._id)}
            onFavoriteToggle={handleFavoriteToggle}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
