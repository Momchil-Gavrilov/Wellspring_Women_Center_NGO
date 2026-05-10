import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';

export default function VolunteerSelectShipment() {
  const navigate = useNavigate();
  const { user, addRecentlyViewed, getRecentlyViewed } = useUser();
  const { shipments } = useData();
  const [selectedShipment, setSelectedShipment] = useState<string>('');

  const handleGo = () => {
    if (selectedShipment) {
      const shipment = shipments.find(s => s.id === selectedShipment);
      if (shipment) addRecentlyViewed({ id: shipment.id, name: shipment.name });
      navigate(`/volunteer/items/${selectedShipment}`);
    }
  };

  const handleRecentClick = (shipmentId: string, shipmentName: string) => {
    addRecentlyViewed({ id: shipmentId, name: shipmentName });
    navigate(`/volunteer/items/${shipmentId}`);
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'V';

  const recentlyViewed = getRecentlyViewed();

  return (
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FDFFEC' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#F6F6F6', borderBottom: '1px solid #E0E0E0' }}>
        {/* Back button — matches Figma gray square */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-12 h-12 hover:opacity-70"
          style={{ backgroundColor: '#A1A1A1', color: '#fff', fontSize: 22, fontFamily: 'Inter, sans-serif' }}
        >
          {'<'}
        </button>

        {/* Avatar + role */}
        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#A1A1A1' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#A1A1A1' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif', color: '#030303' }}>Volunteer</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-start px-8 pt-14">
        <h1
          className="mb-10 font-normal"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 32, color: '#000' }}
        >
          Select Shipment
        </h1>

        <div className="w-full max-w-sm space-y-5">
          {/* Dropdown */}
          <Select value={selectedShipment} onValueChange={setSelectedShipment}>
            <SelectTrigger
              className="h-14 border-none rounded-none"
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

          {/* Go button */}
          <Button
            onClick={handleGo}
            disabled={!selectedShipment}
            className="w-full h-14 text-black hover:opacity-80 disabled:opacity-50 rounded-none font-normal text-2xl"
            style={{ backgroundColor: '#CACACA' }}
          >
            Go
          </Button>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="mt-6">
              <div className="px-4 py-2" style={{ backgroundColor: '#E9E9E9' }}>
                <p className="text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#6B6B6B' }}>
                  Recently Viewed
                </p>
              </div>
              <div style={{ backgroundColor: '#F2F2F2', borderLeft: '4px solid #D9D9D9' }}>
                {recentlyViewed.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleRecentClick(item.id, item.name)}
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
