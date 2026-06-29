import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import SimpleFooter from '../components/common/SimpleFooter';
import LoadingState from '../components/common/LoadingState';
import PropertyBreadcrumb from '../components/property-details/PropertyBreadcrumb';
import PropertyHeroImage from '../components/property-details/PropertyHeroImage';
import PropertyHeader from '../components/property-details/PropertyHeader';
import PropertyAbout from '../components/property-details/PropertyAbout';
import PropertyAmenities from '../components/property-details/PropertyAmenities';
import PropertyLocation from '../components/property-details/PropertyLocation';
import ScheduleViewingCard from '../components/property-details/ScheduleViewingCard';
import EMICalculator from '../components/property-details/EMICalculator';
import BackToTop from '../components/common/BackToTop';
import SimilarProperties from '../components/property-details/SimilarProperties';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { propertiesAPI } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { useSEO } from '../hooks/useSEO';
import StructuredData from '../components/common/StructuredData';

interface PropertyData {
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

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { addItem: addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!property) return;
    addRecentlyViewed({
      id: property._id,
      title: property.title,
      location: property.location,
      price: formatPrice(property.price),
      image: property.image?.[0] || '',
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
    });
  }, [property?._id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Dynamic SEO based on loaded property
  useSEO({
    title: property ? `${property.title} - ${property.location}` : 'Property Details',
    description: property
      ? `${property.title} in ${property.location}. ${property.beds} beds, ${property.baths} baths, ${property.sqft} sqft. ${property.type}.`
      : 'View property details on BuildEstate.',
  });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const { data } = await propertiesAPI.getById(id);
        if (data.success && data.property) {
          setProperty(data.property);
        } else {
          setError('Property not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch property:', err);
        setError('Failed to load property details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Map availability to status
  const getStatus = (availability: string): 'available' | 'sold' | 'pending' => {
    switch (availability?.toLowerCase()) {
      case 'sold': return 'sold';
      case 'pending': return 'pending';
      default: return 'available';
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <LoadingState message="Loading property details..." />
        <SimpleFooter />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <span className="material-icons text-5xl text-[#2563EB] mb-4">error_outline</span>
            <p className="font-manrope text-xl text-[#374151] mb-4">{error || 'Property not found'}</p>
            <Link
              to="/properties"
              className="bg-[#2563EB] text-white font-manrope font-bold px-8 py-3 rounded-lg hover:bg-[#1D4ED8] transition-all inline-block"
            >
              Back to Properties
            </Link>
          </div>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  // Extract city from location string (e.g. "Satellite, Ahmedabad, Gujarat" → "Ahmedabad")
  // Indian addresses typically end with state, so use second-to-last part as city
  const cityParts = property.location.split(',').map(s => s.trim());
  const city = cityParts.length >= 3
    ? cityParts[cityParts.length - 2]       // "Area, City, State" → City
    : cityParts.length === 2
      ? cityParts[0]                         // "City, State" → City
      : cityParts[0];                        // "City" → City

  // Parse amenities — handle legacy data where amenities may be a JSON string
  const parseAmenities = (amenities: string[]): string[] => {
    if (!amenities || amenities.length === 0) return [];
    // If single element that looks like a JSON array, parse it
    if (amenities.length === 1 && typeof amenities[0] === 'string' && amenities[0].startsWith('[')) {
      try {
        const parsed = JSON.parse(amenities[0]);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* fall through */ }
    }
    return amenities;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 z-[100] h-[3px] bg-[#2563EB] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Property Structured Data for SEO */}
      <StructuredData
        type="property"
        data={{
          title: property.title,
          description: property.description,
          location: city,
          region: cityParts[cityParts.length - 1] || '',
          price: property.price,
          sqft: property.sqft,
          beds: property.beds,
          baths: property.baths,
          image: property.image?.[0],
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Breadcrumb Navigation */}
      <PropertyBreadcrumb
        city={city}
        propertyName={property.title}
      />

      {/* Action Bar — Share + WhatsApp */}
      <div className="max-w-[1280px] mx-auto px-8 pt-4 flex justify-end gap-3">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-sm font-manrope font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors border border-[#2563EB] rounded-lg px-4 py-2 hover:bg-blue-50"
        >
          <span className="material-icons text-base">{copied ? 'check' : 'share'}</span>
          {copied ? 'Link Copied!' : 'Share Property'}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in: ${property.title} — ${window.location.href}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-manrope font-semibold text-[#16A34A] hover:text-[#15803D] transition-colors border border-[#16A34A] rounded-lg px-4 py-2 hover:bg-green-50"
        >
          <span className="material-icons text-base">chat</span>
          WhatsApp Enquiry
        </a>
      </div>

      {/* Hero Image */}
      <PropertyHeroImage image={property.image?.[0]} />

      {/* Property Header with Price & Specs */}
      <PropertyHeader
        status={getStatus(property.availability)}
        refNumber={`#${property._id.slice(-8).toUpperCase()}`}
        name={property.title}
        location={property.location}
        price={formatPrice(property.price)}
        beds={property.beds}
        baths={property.baths}
        sqft={property.sqft}
      />

      {/* Main Content Area */}
      <div className="bg-[#F2EFE9] py-12">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-[#E6E0DA] rounded-2xl p-8 shadow-sm">
                {/* About Section */}
                <PropertyAbout description={property.description} />

                {/* Amenities Section */}
                <PropertyAmenities
                  amenities={parseAmenities(property.amenities)}
                />

                {/* Location Section */}
                <PropertyLocation
                  location={property.location}
                  propertyName={property.title}
                />
              </div>
            </div>

            {/* Right Column - Schedule Viewing + EMI Calculator */}
            <div className="lg:col-span-1">
              <ScheduleViewingCard
                property={{ name: property.title, id: property._id }}
              />
              <EMICalculator propertyPrice={property.price} />
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties */}
      <SimilarProperties currentId={property._id} city={city} />

      {/* Simple Footer */}
      <SimpleFooter />

      {/* Back to top */}
      <BackToTop />
    </div>
  );
};

export default PropertyDetailsPage;
