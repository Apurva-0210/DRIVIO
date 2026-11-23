import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastHost from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import BookingSearch from './pages/BookingSearch';
import BookingSeat from './pages/BookingSeat';
import BookingCheckout from './pages/BookingCheckout';
import BookingDetails from './pages/BookingDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import Testimonials from './pages/Testimonials';
import Gallery from './pages/Gallery';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminBookingsList from './pages/Admin/BookingsList';
import AdminBills from './pages/Admin/Bills';
import AdminSchedules from './pages/Admin/Schedules';
import AdminVehicles from './pages/Admin/Vehicles';
import AdminUsers from './pages/Admin/Users';
import AdminTolls from './pages/Admin/Tolls';
import AdminRefunds from './pages/Admin/Refunds';
import AdminCorporate from './pages/Admin/CorporateApprovals';
import AdminContacts from './pages/Admin/Contacts';
import AdminGallery from './pages/Admin/Gallery';

// Agent Pages
import AgentTrips from './pages/Agent/Trips';
import AgentDashboard from './pages/Agent/Dashboard';

// Driver Pages
import DriverDashboard from './pages/Driver/Dashboard';
import DriverRoutes from './pages/Driver/Routes';
import DriverSeats from './pages/Driver/Seats';
import DriverTrips from './pages/Driver/Trips';
import DriverLiveTracker from './pages/Driver/Tracker';

// Manager Pages
import ManagerFleet from './pages/Manager/Fleet';
import ManagerDashboard from './pages/Manager/Dashboard';

// Company Admin Pages
import CompanyCharter from './pages/Company/Charter';
import CompanyRequests from './pages/Company/CharterRequests';

// Customer Pages
import MyBookings from './pages/MyBookings';
import TrackBus from './pages/TrackBus';
import Profile from './pages/Profile';

export default function App() {
  const token = localStorage.getItem('token');
  let user = null;
  if (token) {
    try {
      user = JSON.parse(atob(token.split('.')[1]));
    } catch (_) {
      user = null;
    }
  }

  // Redirect logged-in users from home to their dashboard
  const HomeRedirect = () => {
    const activeToken = localStorage.getItem('token');
    if (!activeToken) return <Home />;
    let activeUser = null;
    try {
      activeUser = JSON.parse(atob(activeToken.split('.')[1]));
    } catch (_) {
      return <Home />;
    }
    
    switch(activeUser?.role) {
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      case 'agent': return <Navigate to="/agent/dashboard" replace />;
      case 'driver': return <Navigate to="/driver/dashboard" replace />;
      case 'manager': return <Navigate to="/manager/dashboard" replace />;
      case 'company_admin': return <Navigate to="/company/charter" replace />;
      case 'customer': return <Navigate to="/my-bookings" replace />;
      default: return <Home />;
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <ToastHost />
      {/* Original Global Top Navbar */}
      <Navbar />

      <div className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/search" element={<BookingSearch />} />
          <Route path="/seats" element={<BookingSeat />} />
          <Route path="/checkout" element={<BookingCheckout />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/gallery" element={<Gallery />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute role="admin">
              <AdminBookingsList />
            </ProtectedRoute>
          } />
          <Route path="/admin/bills" element={
            <ProtectedRoute role="admin">
              <AdminBills />
            </ProtectedRoute>
          } />
          <Route path="/admin/schedules" element={
            <ProtectedRoute role="admin">
              <AdminSchedules />
            </ProtectedRoute>
          } />
          <Route path="/admin/vehicles" element={
            <ProtectedRoute role="admin">
              <AdminVehicles />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/tolls" element={
            <ProtectedRoute role="admin">
              <AdminTolls />
            </ProtectedRoute>
          } />
          <Route path="/admin/refunds" element={
            <ProtectedRoute role="admin">
              <AdminRefunds />
            </ProtectedRoute>
          } />
          <Route path="/admin/corporate" element={
            <ProtectedRoute role="admin">
              <AdminCorporate />
            </ProtectedRoute>
          } />
          <Route path="/admin/contacts" element={
            <ProtectedRoute role="admin">
              <AdminContacts />
            </ProtectedRoute>
          } />
          <Route path="/admin/gallery" element={
            <ProtectedRoute role="admin">
              <AdminGallery />
            </ProtectedRoute>
          } />

          {/* Agent Routes */}
          <Route path="/agent" element={<Navigate to="/agent/dashboard" replace />} />
          <Route path="/agent/dashboard" element={
            <ProtectedRoute role="agent">
              <AgentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/agent/trips" element={
            <ProtectedRoute role="agent">
              <AgentTrips />
            </ProtectedRoute>
          } />

          {/* Driver Routes */}
          <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
          <Route path="/driver/dashboard" element={
            <ProtectedRoute role="driver">
              <DriverDashboard />
            </ProtectedRoute>
          } />
          <Route path="/driver/routes" element={
            <ProtectedRoute role="driver">
              <DriverRoutes />
            </ProtectedRoute>
          } />
          <Route path="/driver/seats" element={
            <ProtectedRoute role="driver">
              <DriverSeats />
            </ProtectedRoute>
          } />
          <Route path="/driver/trips" element={
            <ProtectedRoute role="driver">
              <DriverTrips />
            </ProtectedRoute>
          } />
          <Route path="/driver/tracker" element={
            <ProtectedRoute role="driver">
              <DriverLiveTracker />
            </ProtectedRoute>
          } />

          {/* Manager Routes */}
          <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="/manager/dashboard" element={
            <ProtectedRoute role="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/fleet" element={
            <ProtectedRoute role="manager">
              <ManagerFleet />
            </ProtectedRoute>
          } />
          <Route path="/manager/vehicles" element={<Navigate to="/manager/fleet" replace />} />

          {/* Company Admin Routes */}
          <Route path="/company" element={<Navigate to="/company/charter" replace />} />
          <Route path="/company/charter" element={
            <ProtectedRoute role="company_admin">
              <CompanyCharter />
            </ProtectedRoute>
          } />
          <Route path="/company/requests" element={
            <ProtectedRoute role="company_admin">
              <CompanyRequests />
            </ProtectedRoute>
          } />
          <Route path="/company/charter/requests" element={<Navigate to="/company/requests" replace />} />

          {/* Customer Routes */}
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path="/track-bus" element={<TrackBus />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Original Global Bottom Footer */}
      <Footer />
    </div>
  );
}
