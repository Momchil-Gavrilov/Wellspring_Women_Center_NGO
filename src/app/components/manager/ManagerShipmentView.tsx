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
      ...sumItems.map(item => [item.itemName, item.count.toString(), item.unit, item.category]),
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
      <div className="size-full flex items-center justify-center" style={{ backgroundColor: '#FDFFEC' }}>
        <p>Shipment not found</p>
      </div>
    );
  }

  const displayItems: EntryItem[] =
    activeTab === 'sum'
      ? sumItems
      : (entries.find(e => e.volunteerName === activeTab)?.items ?? []);

  return (
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FDFFEC' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#F6F6F6', borderBottom: '1px solid #E0E0E0' }}>
        <button
          onClick={() => navigate('/manager')}
          className="flex items-center justify-center w-12 h-12 hover:opacity-70"
          style={{ backgroundColor: '#A1A1A1', color: '#fff', fontSize: 22, fontFamily: 'Inter, sans-serif' }}
        >
          {'<'}
        </button>

        <div className="text-center">
          <p className="text-sm" style={{ color: '#6B6B6B' }}>{shipment.date}</p>
          <p className="font-medium">{shipment.name}</p>
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#A1A1A1' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#A1A1A1' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif', color: '#030303' }}>Manager</span>
        </div>
      </div>

      {/* ── Column headers ── */}
      <div className="flex" style={{ backgroundColor: '#CACACA' }}>
        <div className="w-44 p-3 text-sm font-medium">Items</div>
        <div className="w-24 p-3 text-sm font-medium">Count</div>
        <div className="w-24 p-3 text-sm font-medium">Units</div>
        <div className="flex-1 p-3 text-sm font-medium">Category</div>
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
                  style={{ borderBottom: '1px solid #D9D9D9', backgroundColor: i % 2 === 0 ? '#FDFFEC' : '#F6F6F6' }}
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
      <div style={{ borderTop: '1px solid #D9D9D9' }}>
        <ScrollArea orientation="horizontal" className="w-full">
          <div className="flex min-w-max" style={{ backgroundColor: '#D9D9D9' }}>
            <button
              onClick={() => setActiveTab('sum')}
              className="px-6 py-3 text-sm whitespace-nowrap"
              style={{
                backgroundColor: activeTab === 'sum' ? '#CACACA' : '#D9D9D9',
                fontWeight: activeTab === 'sum' ? 600 : 400,
                borderRight: '1px solid #A1A1A1',
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
                  backgroundColor: activeTab === entry.volunteerName ? '#CACACA' : '#D9D9D9',
                  fontWeight: activeTab === entry.volunteerName ? 600 : 400,
                  borderRight: '1px solid #A1A1A1',
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
            className="w-full h-14 text-black hover:opacity-80 rounded-none font-normal text-xl"
            style={{ backgroundColor: '#CACACA' }}
          >
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
