import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { useState } from 'react';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, getRecentlyViewed } = useUser();
  const { shipments } = useData();
  const [selectedShipment, setSelectedShipment] = useState<string>('');

  const handleSelectShipment = (shipmentId: string) => {
    setSelectedShipment(shipmentId);
    navigate(`/manager/shipment/${shipmentId}`);
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'M';

  const recentlyViewed = getRecentlyViewed();

  return (
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E0E0E0' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-10 h-10 hover:opacity-70"
          style={{ backgroundColor: '#BDBDBD', color: '#fff', fontSize: 18, borderRadius: 6 }}
        >
          {'←'}
        </button>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#BDBDBD' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#BDBDBD' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ color: '#030303' }}>Manager</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-8 max-w-2xl mx-auto w-full">
        <div className="w-full max-w-sm space-y-5">

          {/* Create Shipment */}
          <Button
            onClick={() => navigate('/manager/create-shipment')}
            className="w-full h-14 text-white hover:opacity-80 font-normal text-2xl"
            style={{ backgroundColor: '#FAA308' }}
          >
            Create Shipment
          </Button>

          {/* Select Shipment dropdown */}
          <div className="w-full space-y-2">
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              Select Shipment
            </p>
            <Select value={selectedShipment} onValueChange={handleSelectShipment}>
              <SelectTrigger
                className="w-full h-14 border-none"
                style={{ backgroundColor: '#EEEEEE' }}
              >
                <SelectValue placeholder="Choose a shipment" />
              </SelectTrigger>
              <SelectContent>
                {shipments.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Logged Items */}
          <Button
            onClick={() => navigate('/manager/log-items')}
            className="w-full h-14 text-white hover:opacity-80 font-normal text-2xl"
            style={{ backgroundColor: '#FAA308' }}
          >
            Logged Items
          </Button>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="mt-6">
              <div className="px-4 py-2" style={{ backgroundColor: '#F2F2F2', borderRadius: '1rem' }}>
                <p className="text-center" style={{ fontSize: 20, color: '#6B6B6B' }}>
                  Recently Viewed
                </p>
              </div>
              <div style={{ backgroundColor: '#FAFAFA', borderRadius: '1rem' }}>
                {recentlyViewed.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectShipment(item.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100"
                    style={{
                      fontSize: 20,
                      color: '#AAAAAA',
                      textDecoration: 'underline',
                      borderBottom: index < recentlyViewed.length - 1 ? '1px solid #EEEEEE' : 'none',
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
