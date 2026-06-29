import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import LoadingState from '../components/common/LoadingState';
import { appointmentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { useSEO } from '../hooks/useSEO';

interface Appointment {
  _id: string;
  status: string;
  date: string;
  time: string;
  notes?: string;
  propertyId: {
    _id: string;
    title: string;
    location: string;
    price?: number;
    image?: string[];
  };
}

const AppointmentsPage: React.FC = () => {
  useSEO({
    title: 'My Appointments',
    description: 'Review your scheduled property viewings and cancel appointments from your account.',
  });

  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await appointmentsAPI.getByUser();
      if (data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (err: any) {
      console.error('Failed to load appointments:', err);
      setError('Unable to load your appointments right now. Please try again later.');
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

  const handleCancel = async (appointmentId: string) => {
    setCancelingId(appointmentId);
    try {
      await appointmentsAPI.cancel(appointmentId, 'Cancelled by user');
      setAppointments((current) =>
        current.map((item) =>
          item._id === appointmentId ? { ...item, status: 'cancelled' } : item
        )
      );
    } catch (err: any) {
      console.error('Failed to cancel appointment:', err);
      setError('Could not cancel appointment. Please try again.');
    } finally {
      setCancelingId(null);
    }
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-[1180px] mx-auto px-6 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="font-fraunces text-4xl font-bold text-[#111827]">My Appointments</h1>
            <p className="font-manrope text-sm text-[#6B7280] mt-2">
              Track your scheduled viewing requests and cancel any appointments you no longer need.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-manrope font-semibold px-5 py-3 rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            Browse Properties
          </Link>
        </div>

        {loading && <LoadingState message="Loading your appointments..." />}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-manrope text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="rounded-3xl border border-[#E6E0DA] bg-[#F8FAFC] p-10 text-center">
            <span className="material-icons text-5xl text-[#2563EB] mb-5">event_note</span>
            <h2 className="font-fraunces text-2xl font-bold text-[#111827] mb-3">No appointments yet</h2>
            <p className="font-manrope text-sm text-[#6B7280] mb-6">
              You have not scheduled any property viewings yet. Start by browsing listings and requesting a visit.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-manrope font-semibold px-5 py-3 rounded-xl hover:bg-[#1D4ED8] transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="space-y-5">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="rounded-3xl border border-[#E6E0DA] p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-manrope text-xs uppercase tracking-[0.2em] text-[#6B7280] mb-2">
                      {appointment.status === 'pending' && 'Pending Confirmation'}
                      {appointment.status === 'confirmed' && 'Confirmed'}
                      {appointment.status === 'cancelled' && 'Cancelled'}
                      {appointment.status === 'completed' && 'Completed'}
                    </p>
                    <h2 className="font-fraunces text-xl font-semibold text-[#111827]">
                      {appointment.propertyId.title}
                    </h2>
                    <p className="font-manrope text-sm text-[#6B7280] mt-1">
                      {appointment.propertyId.location}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    <span className="font-manrope text-sm text-[#374151]">{formatDate(appointment.date)}</span>
                    <span className="font-fraunces text-lg font-semibold text-[#2563EB]">{appointment.time}</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3 sm:items-center">
                  <div className="sm:col-span-2">
                    <p className="font-manrope text-sm text-[#4B5563]">
                      {appointment.notes || 'No notes added for this appointment.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-between sm:justify-end">
                    <Link
                      to={`/property/${appointment.propertyId._id}`}
                      className="font-manrope text-sm text-[#2563EB] hover:underline"
                    >
                      View property
                    </Link>
                    {['pending', 'confirmed'].includes(appointment.status) && (
                      <button
                        onClick={() => handleCancel(appointment._id)}
                        disabled={cancelingId === appointment._id}
                        className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60"
                      >
                        {cancelingId === appointment._id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </div>
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

export default AppointmentsPage;
