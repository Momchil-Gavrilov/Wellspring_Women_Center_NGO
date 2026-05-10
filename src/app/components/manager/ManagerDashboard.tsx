import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, getRecentlyViewed } = useUser();
  const { shipments } = useData();
  const [selectedShipment, setSelectedShipment] = useState<string>('');

  const handleBack = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleCreateShipment = () => {
    navigate('/manager/create-shipment');
  };

  const handleSelectShipment = (shipmentId: string) => {
    setSelectedShipment(shipmentId);
    navigate(`/manager/shipment/${shipmentId}`);
  };

  const handleLogItems = () => {
    navigate('/manager/log-items');
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'M';

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
          <span className="text-sm mt-1" style={{ color: '#1F1F1F' }}>Manager</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-8 max-w-2xl mx-auto w-full">
        <div className="w-full space-y-6">
          <Button
            onClick={handleCreateShipment}
            className="w-full h-16 text-white text-lg hover:opacity-90"
            style={{ backgroundColor: '#F5A623' }}
          >
            Create Shipment
          </Button>

          <div className="w-full space-y-3">
            <label className="text-lg" style={{ color: '#1F1F1F' }}>Select Shipment</label>
            <Select value={selectedShipment} onValueChange={handleSelectShipment}>
              <SelectTrigger className="w-full h-16 text-lg" style={{ backgroundColor: '#E8E8E8' }}>
                <SelectValue placeholder="Choose a shipment" />
              </SelectTrigger>
              <SelectContent>
                {shipments.map((shipment) => (
                  <SelectItem key={shipment.id} value={shipment.id}>
                    {shipment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleLogItems}
            className="w-full h-16 text-white text-lg hover:opacity-90"
            style={{ backgroundColor: '#F5A623' }}
          >
            Logged Items
          </Button>

          {recentlyViewed.length > 0 && (
            <div className="w-full pt-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="text-sm text-gray-600 mb-3">Recently Viewed</h3>
                <div className="space-y-2">
                  {recentlyViewed.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectShipment(item.id)}
                      className="block w-full text-left text-gray-500 hover:text-gray-700 underline"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
