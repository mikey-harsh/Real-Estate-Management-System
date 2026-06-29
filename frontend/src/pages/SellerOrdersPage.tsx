import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import LoadingState from '../components/common/LoadingState';
import { appointmentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSEO } from '../hooks/useSEO';

interface SellerAppointment {
  _id: string;
  status: string;
  date: string;
  time: string;
  notes?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  propertyId: {
    _id: string;
    title: string;
    location: string;
    price?: number;
    image?: string[];
  };
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
};

const SellerOrdersPage: React.FC = () => {
  useSEO({
    title: 'Viewing Requests',
    description: 'Manage appointment requests from buyers interested in your listed properties.',
  });

  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [appointments, setAppointments] = useState<SellerAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await appointmentsAPI.getBySeller();
      if (data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (err: any) {
      console.error('Failed to load seller appointments:', err);
      setError('Unable to load viewing requests right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, fetchAppointments]);

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    setUpdatingId(appointmentId);
    try {
      await appointmentsAPI.updateStatus(appointmentId, status);
      setAppointments((current) =>
        current.map((item) =>
          item._id === appointmentId ? { ...item, status } : item
        )
      );
    } catch (err: any) {
      console.error('Failed to update appointment:', err);
      setError('Could not update the request. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[1180px] mx-auto px-6 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="font-fraunces text-4xl font-bold text-[#111827]">Viewing Requests</h1>
            <p className="font-manrope text-sm text-[#6B7280] mt-2">
              Review and manage appointment requests from buyers interested in your properties.
            </p>
          </div>
          <Link
            to="/my-listings"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-manrope font-semibold px-5 py-3 rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            My Listings
          </Link>
        </div>

        {loading && <LoadingState message="Loading viewing requests..." />}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-manrope text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="rounded-3xl border border-[#E6E0DA] bg-[#F8FAFC] p-10 text-center">
            <span className="material-icons text-5xl text-[#2563EB] mb-5">inbox</span>
            <h2 className="font-fraunces text-2xl font-bold text-[#111827] mb-3">No requests yet</h2>
            <p className="font-manrope text-sm text-[#6B7280] mb-6">
              You have not received any viewing requests yet. Once buyers schedule appointments for your listings, they will appear here.
            </p>
            <Link
              to="/my-listings"
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-manrope font-semibold px-5 py-3 rounded-xl hover:bg-[#1D4ED8] transition-colors"
            >
              View My Listings
            </Link>
          </div>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="space-y-5">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="rounded-3xl border border-[#E6E0DA] p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 font-manrope text-xs font-semibold ${STATUS_COLORS[appointment.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
                      >
                        {STATUS_LABELS[appointment.status] ?? appointment.status}
                      </span>
                    </div>
                    <h2 className="font-fraunces text-xl font-semibold text-[#111827]">
                      {appointment.propertyId?.title ?? 'Property'}
                    </h2>
                    <p className="font-manrope text-sm text-[#6B7280] mt-1">
                      {appointment.propertyId?.location}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 text-right shrink-0">
                    <span className="font-manrope text-sm text-[#374151]">{formatDate(appointment.date)}</span>
                    <span className="font-fraunces text-lg font-semibold text-[#2563EB]">{appointment.time}</span>
                  </div>
                </div>

                {(appointment.buyerName || appointment.buyerEmail || appointment.buyerPhone) && (
                  <div className="mt-4 rounded-2xl bg-[#F8FAFC] border border-[#E6E0DA] px-5 py-4">
                    <p className="font-manrope text-xs uppercase tracking-widest text-[#9CA3AF] mb-2">Buyer Details</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      {appointment.buyerName && (
                        <span className="font-manrope text-sm text-[#374151]">{appointment.buyerName}</span>
                      )}
                      {appointment.buyerEmail && (
                        <a href={`mailto:${appointment.buyerEmail}`} className="font-manrope text-sm text-[#2563EB] hover:underline">
                          {appointment.buyerEmail}
                        </a>
                      )}
                      {appointment.buyerPhone && (
                        <span className="font-manrope text-sm text-[#374151]">{appointment.buyerPhone}</span>
                      )}
                    </div>
                  </div>
                )}

                {appointment.notes && (
                  <p className="mt-4 font-manrope text-sm text-[#4B5563]">{appointment.notes}</p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3 justify-between">
                  <Link
                    to={`/property/${appointment.propertyId?._id}`}
                    className="font-manrope text-sm text-[#2563EB] hover:underline"
                  >
                    View property
                  </Link>

                  {appointment.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                        disabled={updatingId === appointment._id}
                        className="inline-flex items-center justify-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-60"
                      >
                        {updatingId === appointment._id ? 'Updating…' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                        disabled={updatingId === appointment._id}
                        className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60"
                      >
                        {updatingId === appointment._id ? 'Updating…' : 'Decline'}
                      </button>
                    </div>
                  )}

                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                      disabled={updatingId === appointment._id}
                      className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-60"
                    >
                      {updatingId === appointment._id ? 'Updating…' : 'Mark Completed'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SellerOrdersPage;
