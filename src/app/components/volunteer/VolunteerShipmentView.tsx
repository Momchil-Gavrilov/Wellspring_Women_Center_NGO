import { useNavigate, useParams } from 'react-router';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { EntryItem } from '../../../services/api';

export default function VolunteerShipmentView() {
  const navigate = useNavigate();
  const { shipmentId } = useParams();
  const { user, addRecentlyViewed } = useUser();
  const { shipments, getShipmentEntries } = useData();

  const [entries, setEntries] = useState<EntryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const shipment = shipments.find(s => s.id === shipmentId);

  useEffect(() => {
    if (shipment) addRecentlyViewed({ id: shipment.id, name: shipment.name });
  }, [shipment, addRecentlyViewed]);

  // Load this volunteer's saved entries for the shipment
  useEffect(() => {
    if (!shipmentId) return;
    setLoading(true);
    getShipmentEntries(shipmentId)
      .then(allEntries => {
        // Flatten all volunteer entries into one list for display
        const items = allEntries.flatMap(e => e.items);
        setEntries(items);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [shipmentId, getShipmentEntries]);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'V';

  if (!shipment) {
    return (
      <div className="size-full bg-white flex items-center justify-center">
        <p>Shipment not found</p>
      </div>
    );
  }

  return (
    <div className="size-full bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/volunteer')}
          className="w-12 h-12 hover:opacity-80"
          style={{ backgroundColor: '#9B9B9B' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">{shipment.date}</p>
          <p className="font-medium">{shipment.name}</p>
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#9B9B9B' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#9B9B9B' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1">Volunteer</span>
        </div>
      </div>

      <div className="bg-gray-200 p-4 sticky top-0 z-10">
        <div className="flex gap-2">
          <div className="w-40 font-medium">Items</div>
          <div className="w-24 font-medium">Count</div>
          <div className="w-24 font-medium">Units</div>
          <div className="w-32 font-medium">Category</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="divide-y pr-1">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading…</div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No items logged yet</div>
            ) : (
              entries.map((item, index) => (
                <div key={index} className="flex gap-2 p-4">
                  <div className="w-40">{item.itemName}</div>
                  <div className="w-24">{item.count}</div>
                  <div className="w-24">{item.unit}</div>
                  <div className="w-32">{item.category}</div>
                </div>
              ))
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      <div className="p-4 border-t">
        <Button
          onClick={() => navigate(`/volunteer/items/${shipmentId}`)}
          className="w-full h-16 text-white hover:opacity-90"
          style={{ backgroundColor: '#F5A623' }}
        >
          Add Items
        </Button>
      </div>
    </div>
  );
}
