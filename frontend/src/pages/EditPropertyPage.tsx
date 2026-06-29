import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import LoadingState from '../components/common/LoadingState';
import { propertiesAPI, userListingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSEO } from '../hooks/useSEO';

interface FormState {
  title: string;
  type: string;
  availability: string;
  location: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  description: string;
  phone: string;
  amenities: string[];
}

const PROPERTY_TYPES = ['Flat', 'House', 'Villa', 'Plot', 'Penthouse', 'Studio', 'Commercial'];
const AVAILABILITY_OPTIONS = ['For Sale', 'For Rent'];
const AMENITIES_LIST = [
  'Parking', 'Swimming Pool', 'Gym', 'Security', 'Power Backup',
  'Lift', 'Garden', 'Club House', 'CCTV', 'Intercom',
  'Rainwater Harvesting', 'Gated Community', 'Children Play Area',
  'Jogging Track', 'Basketball Court',
];

const EditPropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  const [form, setForm] = useState<FormState>({
    title: '',
    type: 'Flat',
    availability: 'For Sale',
    location: '',
    price: '',
    beds: '',
    baths: '',
    sqft: '',
    description: '',
    phone: '',
    amenities: [],
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useSEO({
    title: 'Edit Property',
    description: 'Make updates to your listing and resubmit it for review.',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data } = await propertiesAPI.getById(id);
        if (data.success && data.property) {
          const property = data.property;
          setForm({
            title: property.title || '',
            type: property.type || 'Flat',
            availability: property.availability || 'For Sale',
            location: property.location || '',
            price: String(property.price || ''),
            beds: String(property.beds || ''),
            baths: String(property.baths || ''),
            sqft: String(property.sqft || ''),
            description: property.description || '',
            phone: property.phone || '',
            amenities: Array.isArray(property.amenities) ? property.amenities : [],
          });
          setExistingImages(Array.isArray(property.image) ? property.image : []);
        } else {
          setError('Property not found.');
        }
      } catch (err: any) {
        console.error('Failed to load property:', err);
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === 'amenity') {
      const amenity = value;
      setForm((prev) => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, amenity]
          : prev.amenities.filter((item) => item !== amenity),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - images.length;
    if (remaining <= 0) {
      toast.error('Maximum 4 new images allowed.');
      return;
    }
    const allowed = files.slice(0, remaining);
    setImages((prev) => [...prev, ...allowed]);
    const newPreviews = allowed.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, idx) => idx !== index));
    setPreviews((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!user || user.role !== 'seller') {
      setError('Only seller accounts may edit listings.');
      return;
    }

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('location', form.location);
    fd.append('price', form.price);
    fd.append('beds', form.beds);
    fd.append('baths', form.baths);
    fd.append('sqft', form.sqft);
    fd.append('type', form.type);
    fd.append('availability', form.availability);
    fd.append('description', form.description);
    fd.append('phone', form.phone);
    fd.append('amenities', JSON.stringify(form.amenities));
    images.forEach((image) => fd.append('images', image));

    setSaving(true);
    setError(null);
    try {
      await userListingsAPI.update(id, fd);
      toast.success('Listing updated successfully.');
      navigate('/my-listings');
    } catch (err: any) {
      console.error('Update failed:', err);
      setError(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <Navbar />
        <LoadingState message="Loading listing details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="font-manrope text-lg text-red-700 mb-6">{error}</p>
          <Link
            to="/my-listings"
            className="bg-[#2563EB] text-white font-manrope font-semibold px-6 py-3 rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            Back to My Listings
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-fraunces text-4xl font-bold text-[#221410]">Edit Listing</h1>
          <p className="font-manrope text-sm text-[#6B7280] mt-2">
            Update your property details and resubmit the listing for review.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white border border-[#E6E0DA] rounded-2xl p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Price</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Bedrooms</label>
                <input
                  name="beds"
                  type="number"
                  value={form.beds}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Bathrooms</label>
                <input
                  name="baths"
                  type="number"
                  value={form.baths}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Square Feet</label>
                <input
                  name="sqft"
                  type="number"
                  value={form.sqft}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Availability</label>
                <select
                  name="availability"
                  value={form.availability}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                >
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Property Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Contact Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={5}
                required
                className="w-full rounded-2xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-3">Amenities</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {AMENITIES_LIST.map((amenity) => {
                  const checked = form.amenities.includes(amenity);
                  return (
                    <label key={amenity} className="inline-flex items-center gap-2 rounded-2xl border border-[#E6E0DA] bg-[#FFFFFF] px-4 py-3 text-sm text-[#374151] hover:border-[#2563EB] cursor-pointer">
                      <input
                        type="checkbox"
                        name="amenity"
                        value={amenity}
                        checked={checked}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      {amenity}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Upload New Images</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full rounded-xl border border-[#E6E0DA] bg-[#FAF8F4] px-4 py-3 text-sm text-[#111827] file:mr-4 file:rounded-full file:border-0 file:bg-[#2563EB] file:px-4 file:py-2 file:text-white file:font-semibold"
              />
              <p className="mt-2 text-sm text-[#6B7280]">Upload up to 4 new images to replace the existing set. Leave blank to preserve current images.</p>
            </div>

            {(existingImages.length > 0 || previews.length > 0) && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {existingImages.map((src, idx) => (
                  <div key={`existing-${idx}`} className="group relative overflow-hidden rounded-3xl border border-[#E6E0DA] bg-[#F8FAFC]">
                    <img src={src} alt={`Existing ${idx + 1}`} className="h-40 w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/30 p-3 text-white text-xs">Existing image</div>
                  </div>
                ))}
                {previews.map((src, idx) => (
                  <div key={`preview-${idx}`} className="relative overflow-hidden rounded-3xl border border-[#E6E0DA] bg-[#F8FAFC]">
                    <img src={src} alt={`Preview ${idx + 1}`} className="h-40 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-sm text-[#111827] hover:bg-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/my-listings"
              className="inline-flex items-center justify-center rounded-xl border border-[#E6E0DA] bg-white px-6 py-3 text-sm font-semibold text-[#374151] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
            >
              Back to My Listings
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-70"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditPropertyPage;
