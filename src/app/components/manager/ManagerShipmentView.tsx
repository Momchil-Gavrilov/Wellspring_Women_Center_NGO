import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { ArrowLeft } from 'lucide-react';
import type { EntryItem, VolunteerEntry } from '../../../services/api';

export default function ManagerShipmentView() {
  const navigate = useNavigate();
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const { user } = useUser();
  const { shipments, getShipmentEntries, getShipmentSum } = useData();

  const [sumItems, setSumItems] = useState<EntryItem[]>([]);
  const [entries, setEntries] = useState<VolunteerEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>('sum');
  const [loading, setLoading] = useState(true);

  const shipment = shipments.find(s => s.id === shipmentId);

  useEffect(() => {
    if (!shipmentId) return;
    setLoading(true);
    Promise.all([
      getShipmentSum(shipmentId),
      getShipmentEntries(shipmentId),
    ])
      .then(([sum, allEntries]) => {
        setSumItems(sum);
        setEntries(allEntries);
      })
      .catch(() => {
        setSumItems([]);
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, [shipmentId, getShipmentSum, getShipmentEntries]);

  const handleBack = () => navigate('/manager');
  const handleProfileClick = () => navigate('/profile');

  const handleExport = () => {
    const rows = [
      ['Items', 'Count', 'Units', 'Category'],
      ...sumItems.map(item => [item.itemName, item.count.toString(), item.unit, item.category]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${shipment?.name || 'shipment'}.csv`;
    a.click();
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'M';

  if (!shipment) {
    return (
      <div className="size-full bg-white flex items-center justify-center">
        <p>Shipment not found</p>
      </div>
    );
  }

  const displayItems: EntryItem[] =
    activeTab === 'sum'
      ? sumItems
      : (entries.find(e => e.volunteerName === activeTab)?.items ?? []);

  return (
    <div className="size-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="w-12 h-12 hover:opacity-80"
          style={{ backgroundColor: '#9B9B9B' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">{shipment.date}</p>
          <p className="font-medium">{shipment.name}</p>
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={handleProfileClick}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#9B9B9B' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#9B9B9B' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1">Manager</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="bg-gray-200 p-4">
        <div className="flex gap-2">
          <div className="w-40 font-medium">Items</div>
          <div className="w-24 font-medium">Count</div>
          <div className="w-24 font-medium">Units</div>
          <div className="w-32 font-medium">Category</div>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : (
            <div className="divide-y pr-1">
              {displayItems.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No items logged yet</div>
              ) : (
                displayItems.map((item, index) => (
                  <div key={index} className="flex gap-2 p-4">
                    <div className="w-40">{item.itemName}</div>
                    <div className="w-24">{item.count}</div>
                    <div className="w-24">{item.unit}</div>
                    <div className="w-32">{item.category}</div>
                  </div>
                ))
              )}
            </div>
          )}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* Volunteer tabs + export */}
      <div className="border-t">
        <ScrollArea orientation="horizontal" className="w-full">
          <div className="flex bg-gray-200 min-w-max">
            <button
              onClick={() => setActiveTab('sum')}
              className={`px-6 py-4 border-r border-gray-400 whitespace-nowrap ${
                activeTab === 'sum' ? 'bg-gray-300 font-semibold' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Sum Sheet
            </button>
            {entries.map((entry, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(entry.volunteerName)}
                className={`px-6 py-4 border-r border-gray-400 whitespace-nowrap ${
                  activeTab === entry.volunteerName
                    ? 'bg-gray-300 font-semibold'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {entry.volunteerName}
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4">
          <Button
            onClick={handleExport}
            className="w-full h-16 bg-gray-300 hover:bg-gray-400 text-black"
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
