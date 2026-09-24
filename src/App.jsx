import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import EventGrid from './components/EventGrid';
import TrendingRow from './components/TrendingRow';
import AppBanner from './components/AppBanner';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

// Modals & Fullstack additions
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import SeatMapModal from './components/SeatMapModal';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminEvents from './components/admin/AdminEvents';
import AdminVenues from './components/admin/AdminVenues';
import AdminBookings from './components/admin/AdminBookings';
import AdminUsers from './components/admin/AdminUsers';
import { apiFetch } from './api/client';

function MainStorefront() {
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pendingBookingEvent, setPendingBookingEvent] = useState(null);

  // Modals & views
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [authAlertMessage, setAuthAlertMessage] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('overview');

  // Resume booking automatically when the user signs up / signs in
  useEffect(() => {
    if (user && pendingBookingEvent) {
      setSelectedEvent(pendingBookingEvent);
      setPendingBookingEvent(null);
      addToast(`Signed in! Resuming booking for ${pendingBookingEvent.title}`, 'success');
    }
  }, [user, pendingBookingEvent, addToast]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    const el = document.getElementById('event-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBookNow = (event) => {
    if (!user) {
      setPendingBookingEvent(event);
      setAuthMode('signup');
      setAuthAlertMessage('⚠️ Registration Required: Please create an account or sign in to book your tickets.');
      setAuthModalOpen(true);
      addToast('⚠️ Please create an account or sign in to book tickets!', 'error');
      return;
    }
    setSelectedEvent(event);
  };

  if (viewingAdmin && isAdmin) {
    return (
      <AdminLayout
        activeTab={adminTab}
        setActiveTab={setAdminTab}
        onExitAdmin={() => setViewingAdmin(false)}
      >
        {adminTab === 'overview' && <AdminDashboard />}
        {adminTab === 'events' && <AdminEvents />}
        {adminTab === 'venues' && <AdminVenues />}
        {adminTab === 'bookings' && <AdminBookings />}
        {adminTab === 'users' && <AdminUsers />}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen app-bg relative">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCategoryChange={handleCategoryChange}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthAlertMessage('');
          setAuthModalOpen(true);
        }}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenAdmin={() => setViewingAdmin(true)}
      />

      <main>
        <div className="pt-16">
          <Hero onBookNow={handleBookNow} />
        </div>

        <TrendingRow onBook={handleBookNow} />

        <div id="event-grid">
          <EventGrid
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            onBook={handleBookNow}
          />
        </div>

        <AppBanner />
        <Testimonials />
      </main>

      <Footer />

      {/* Interactive Seat-Map & Booking Modal */}
      {selectedEvent && (
        <SeatMapModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRequireAuth={() => {
            const ev = selectedEvent;
            setSelectedEvent(null);
            setPendingBookingEvent(ev);
            setAuthMode('signup');
            setAuthAlertMessage('⚠️ Registration Required: Please create an account or sign in to complete your ticket booking.');
            setAuthModalOpen(true);
            addToast('⚠️ You must create an account or sign in before booking tickets!', 'error');
          }}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthAlertMessage('');
        }}
        initialMode={authMode}
        alertMessage={authAlertMessage}
      />

      {/* User Profile & Booking History Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainStorefront />
      </ToastProvider>
    </AuthProvider>
  );
}
