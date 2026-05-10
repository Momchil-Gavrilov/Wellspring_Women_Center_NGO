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
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FDFFEC' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#F6F6F6', borderBottom: '1px solid #E0E0E0' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-12 h-12 hover:opacity-70"
          style={{ backgroundColor: '#A1A1A1', color: '#fff', fontSize: 22, fontFamily: 'Inter, sans-serif' }}
        >
          {'<'}
        </button>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#A1A1A1' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#A1A1A1' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif', color: '#030303' }}>Manager</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-8 max-w-2xl mx-auto w-full">
        <div className="w-full max-w-sm space-y-5">

          {/* Create Shipment */}
          <Button
            onClick={() => navigate('/manager/create-shipment')}
            className="w-full h-14 text-black hover:opacity-80 rounded-none font-normal text-2xl"
            style={{ backgroundColor: '#CACACA' }}
          >
            Create Shipment
          </Button>

          {/* Select Shipment dropdown */}
          <div className="w-full space-y-2">
            <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B6B6B' }}>
              Select Shipment
            </p>
            <Select value={selectedShipment} onValueChange={handleSelectShipment}>
              <SelectTrigger
                className="w-full h-14 border-none rounded-none"
                style={{ backgroundColor: '#D9D9D9' }}
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
            className="w-full h-14 text-black hover:opacity-80 rounded-none font-normal text-2xl"
            style={{ backgroundColor: '#CACACA' }}
          >
            Logged Items
          </Button>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="mt-6">
              <div className="px-4 py-2" style={{ backgroundColor: '#E9E9E9' }}>
                <p className="text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#6B6B6B' }}>
                  Recently Viewed
                </p>
              </div>
              <div style={{ backgroundColor: '#F2F2F2' }}>
                {recentlyViewed.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectShipment(item.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 20,
                      color: '#AAAAAA',
                      textDecoration: 'underline',
                      borderBottom: index < recentlyViewed.length - 1 ? '1px solid #D9D9D9' : 'none',
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
