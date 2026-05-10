import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
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
    Promise.all([getShipmentSum(shipmentId), getShipmentEntries(shipmentId)])
      .then(([sum, allEntries]) => { setSumItems(sum); setEntries(allEntries); })
      .catch(() => { setSumItems([]); setEntries([]); })
      .finally(() => setLoading(false));
  }, [shipmentId, getShipmentSum, getShipmentEntries]);

  const handleExport = () => {
    const rows = [
      ['Items', 'Count', 'Units', 'Category'],
      ...displayItems.map(item => [item.itemName, item.count.toString(), item.unit, item.category]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${shipment?.name || 'shipment'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'M';

  if (!shipment) {
    return (
      <div className="size-full flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <p>Shipment not found</p>
      </div>
    );
  }

  const displayItems: EntryItem[] =
    activeTab === 'sum'
      ? sumItems
      : (entries.find(e => e.volunteerName === activeTab)?.items ?? []);

  return (
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E0E0E0' }}>
        <button
          onClick={() => navigate('/manager')}
          className="flex items-center justify-center w-10 h-10 hover:opacity-70"
          style={{ backgroundColor: '#BDBDBD', color: '#fff', fontSize: 18, borderRadius: 6 }}
        >
          {'←'}
        </button>

        <div className="text-center">
          <p className="text-sm" style={{ color: '#6B6B6B' }}>{shipment.date}</p>
          <p className="font-medium">{shipment.name}</p>
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-12 h-12" style={{ backgroundColor: '#BDBDBD' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#BDBDBD' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ color: '#030303' }}>Manager</span>
        </div>
      </div>

      {/* ── Column headers ── */}
      <div className="flex" style={{ backgroundColor: '#EEF0F3', borderBottom: '1px solid #E0E0E0' }}>
        <div className="w-44 p-3 text-sm font-medium" style={{ color: '#3B3B3B' }}>Items</div>
        <div className="w-24 p-3 text-sm font-medium" style={{ color: '#3B3B3B' }}>Count</div>
        <div className="w-24 p-3 text-sm font-medium" style={{ color: '#3B3B3B' }}>Units</div>
        <div className="flex-1 p-3 text-sm font-medium" style={{ color: '#3B3B3B' }}>Category</div>
      </div>

      {/* ── Rows ── */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="p-8 text-center" style={{ color: '#6B6B6B' }}>Loading…</div>
          ) : displayItems.length === 0 ? (
            <div className="p-8 text-center" style={{ color: '#6B6B6B' }}>No items logged yet</div>
          ) : (
            <div>
              {displayItems.map((item, i) => (
                <div
                  key={i}
                  className="flex"
                  style={{ borderBottom: '1px solid #F0F0F0', backgroundColor: '#FFFFFF' }}
                >
                  <div className="w-44 p-3 text-sm">{item.itemName}</div>
                  <div className="w-24 p-3 text-sm">{item.count}</div>
                  <div className="w-24 p-3 text-sm">{item.unit}</div>
                  <div className="flex-1 p-3 text-sm">{item.category}</div>
                </div>
              ))}
            </div>
          )}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* ── Bottom: volunteer tabs + export ── */}
      <div style={{ borderTop: '1px solid #E0E0E0' }}>
        <ScrollArea orientation="horizontal" className="w-full">
          <div className="flex min-w-max" style={{ backgroundColor: '#EEF0F3' }}>
            <button
              onClick={() => setActiveTab('sum')}
              className="px-6 py-3 text-sm whitespace-nowrap"
              style={{
                backgroundColor: activeTab === 'sum' ? '#E0E4E8' : 'transparent',
                fontWeight: activeTab === 'sum' ? 600 : 400,
                borderRight: '1px solid #D8DCDF',
              }}
            >
              Sum Sheet
            </button>
            {entries.map((entry, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(entry.volunteerName)}
                className="px-6 py-3 text-sm whitespace-nowrap"
                style={{
                  backgroundColor: activeTab === entry.volunteerName ? '#E0E4E8' : 'transparent',
                  fontWeight: activeTab === entry.volunteerName ? 600 : 400,
                  borderRight: '1px solid #D8DCDF',
                }}
              >
                {entry.volunteerName}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="p-4">
          <Button
            onClick={handleExport}
            className="w-full h-14 text-white hover:opacity-80 font-normal text-xl"
            style={{ backgroundColor: '#FAA308' }}
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
