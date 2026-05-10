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

        {/* Avatar + role */}
        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#BDBDBD' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#BDBDBD' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ color: '#030303' }}>Volunteer</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-start px-8 pt-14">
        <h1
          className="mb-10 font-normal"
          style={{ fontSize: 32, color: '#000' }}
        >
          Select Shipment
        </h1>

        <div className="w-full max-w-sm space-y-5">
          {/* Dropdown */}
          <Select value={selectedShipment} onValueChange={setSelectedShipment}>
            <SelectTrigger
              className="h-14 border-none"
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

          {/* Go button */}
          <Button
            onClick={handleGo}
            disabled={!selectedShipment}
            className="w-full h-14 text-black hover:opacity-80 disabled:opacity-50 font-normal text-2xl"
            style={{ backgroundColor: '#E0E0E0' }}
          >
            Go
          </Button>

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="mt-6">
              <div className="px-4 py-2" style={{ backgroundColor: '#F2F2F2', borderRadius: '1rem' }}>
                <p className="text-center" style={{ fontSize: 20, color: '#6B6B6B' }}>
                  Recently Viewed
                </p>
              </div>
              <div style={{ backgroundColor: '#FAFAFA', borderLeft: '4px solid #EEEEEE', borderRadius: '1rem' }}>
                {recentlyViewed.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleRecentClick(item.id, item.name)}
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
