import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import VolunteerSelectShipment from './components/volunteer/VolunteerSelectShipment';
import VolunteerItemsEntry from './components/volunteer/VolunteerItemsEntry';
import VolunteerShipmentView from './components/volunteer/VolunteerShipmentView';
import ManagerDashboard from './components/manager/ManagerDashboard';
import ManagerCreateShipment from './components/manager/ManagerCreateShipment';
import ManagerLogItems from './components/manager/ManagerLogItems';
import ManagerShipmentView from './components/manager/ManagerShipmentView';
import ManagerItemsCatalog from './components/manager/ManagerItemsCatalog';
import BookkeeperSelectSheet from './components/bookkeeper/BookkeeperSelectSheet';
import BookkeeperMasterSheet from './components/bookkeeper/BookkeeperMasterSheet';
import ProfileScreen from './components/ProfileScreen';
import { UserProvider } from './context/UserContext';
import { DataProvider } from './context/DataContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <UserProvider>
      <DataProvider>
        <BrowserRouter>
          <div className="size-full bg-white">
            <Routes>
              <Route path="/" element={<LoginScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />

              {/* Volunteer Routes */}
              <Route path="/volunteer" element={<VolunteerSelectShipment />} />
              <Route path="/volunteer/view/:shipmentId" element={<VolunteerShipmentView />} />
              <Route path="/volunteer/items/:shipmentId" element={<VolunteerItemsEntry />} />

              {/* Manager Routes */}
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/create-shipment" element={<ManagerCreateShipment />} />
              <Route path="/manager/shipment/:shipmentId" element={<ManagerShipmentView />} />
              <Route path="/manager/log-items" element={<ManagerLogItems />} />
              <Route path="/manager/items-catalog" element={<ManagerItemsCatalog />} />

              {/* Bookkeeper Routes */}
              <Route path="/bookkeeper" element={<BookkeeperSelectSheet />} />
              <Route path="/bookkeeper/master-sheet/:sheetId" element={<BookkeeperMasterSheet />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toaster />
        </BrowserRouter>
      </DataProvider>
    </UserProvider>
  );
}
