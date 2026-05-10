import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { ArrowLeft } from 'lucide-react';

export default function VolunteerSelectShipment() {
  const navigate = useNavigate();
  const { user, addRecentlyViewed, getRecentlyViewed } = useUser();
  const { shipments } = useData();
  const [selectedShipment, setSelectedShipment] = useState<string>('');

  const handleGo = () => {
    if (selectedShipment) {
      const shipment = shipments.find(s => s.id === selectedShipment);
      if (shipment) {
        addRecentlyViewed({ id: shipment.id, name: shipment.name });
      }
      navigate(`/volunteer/items/${selectedShipment}`);
    }
  };

  const handleRecentClick = (shipmentId: string, shipmentName: string) => {
    addRecentlyViewed({ id: shipmentId, name: shipmentName });
    navigate(`/volunteer/items/${shipmentId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'V';

  const recentlyViewed = getRecentlyViewed();

  return (
    <div className="size-full bg-white flex flex-col">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="w-12 h-12 hover:opacity-80"
          style={{ backgroundColor: '#9B9B9B' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Button>

        <div className="flex flex-col items-center cursor-pointer" onClick={handleProfileClick}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#9B9B9B' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#9B9B9B' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1">Volunteer</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-8 pt-16">
        <h1 className="text-4xl mb-12">Select Shipment</h1>

        <div className="w-full max-w-lg space-y-6">
          <Select value={selectedShipment} onValueChange={setSelectedShipment}>
            <SelectTrigger className="h-16 bg-gray-200 border-none">
              <SelectValue placeholder="Choose a shipment" />
            </SelectTrigger>
            <SelectContent>
              {shipments.map(shipment => (
                <SelectItem key={shipment.id} value={shipment.id}>
                  {shipment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleGo}
            disabled={!selectedShipment}
            className="w-full h-16 bg-gray-300 hover:bg-gray-400 text-black disabled:opacity-50"
          >
            Go
          </Button>

          {recentlyViewed.length > 0 && (
            <div className="mt-8">
              <div className="bg-gray-100 px-4 py-3 mb-2">
                <p className="text-gray-600">Recently Viewed</p>
              </div>
              <div className="bg-white border border-gray-200">
                {recentlyViewed.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleRecentClick(item.id, item.name)}
                    className={`w-full text-left px-4 py-3 text-gray-400 hover:bg-gray-50 ${
                      index < recentlyViewed.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
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
