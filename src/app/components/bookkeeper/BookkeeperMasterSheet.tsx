import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { toast } from 'sonner';
import type { EntryItem, VolunteerEntry } from '../../../services/api';

function formatDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function BookkeeperMasterSheet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '';
  const to   = searchParams.get('to')   || '';

  const { user } = useUser();
  const { shipments, pricing, getShipmentSum, getShipmentEntries, upsertPrice } = useData();

  // ── Active tab state ────────────────────────────────────────────────────────
  // activeTab:    'master' | shipmentId
  // activeSubTab: 'sum'    | volunteerName  (only when activeTab ≠ 'master')
  const [activeTab, setActiveTab]       = useState<string>('master');
  const [activeSubTab, setActiveSubTab] = useState<string>('sum');

  // ── Fetched data ─────────────────────────────────────────────────────────────
  const [masterItems, setMasterItems]         = useState<EntryItem[]>([]);
  const [shipmentSums, setShipmentSums]       = useState<Record<string, EntryItem[]>>({});
  const [shipmentEntries, setShipmentEntries] = useState<Record<string, VolunteerEntry[]>>({});
  const [loading, setLoading]                 = useState(true);

  // ── Price editing ────────────────────────────────────────────────────────────
  // localPrices: itemName.toLowerCase() → dollar string (e.g. "1.25")
  const [localPrices, setLocalPrices] = useState<Record<string, string>>({});

  // Map itemName → EntryItem so we can look up unit when saving prices
  const itemDetailsRef = useRef<Record<string, EntryItem>>({});

  // ── Derived: shipments in selected date range ─────────────────────────────
  const shipmentsInRange = shipments.filter(
    s => s.date >= from && s.date <= to
  );

  // ── Seed prices from persisted pricing context ────────────────────────────
  useEffect(() => {
    setLocalPrices(prev => {
      const next = { ...prev };
      pricing.forEach(p => {
        const key = p.itemName.toLowerCase();
        if (!next[key]) next[key] = p.dollarsPerUnit.toString();
      });
      return next;
    });
  }, [pricing]);

  // ── Fetch all shipment sums → build master aggregate ─────────────────────
  useEffect(() => {
    if (!from || !to) { setLoading(false); return; }
    if (shipmentsInRange.length === 0) { setMasterItems([]); setLoading(false); return; }

    setLoading(true);
    Promise.all(shipmentsInRange.map(s => getShipmentSum(s.id).then(sum => ({ id: s.id, sum }))))
      .then(results => {
        // Cache per-shipment sums
        const sumsMap: Record<string, EntryItem[]> = {};
        results.forEach(({ id, sum }) => { sumsMap[id] = sum; });
        setShipmentSums(sumsMap);

        // Build master aggregate (sum counts across all shipments)
        const masterMap: Record<string, EntryItem> = {};
        results.forEach(({ sum }) => {
          sum.forEach(item => {
            const key = item.itemName.toLowerCase();
            if (!masterMap[key]) masterMap[key] = { ...item, count: 0 };
            masterMap[key].count += item.count;
            // track item details for price-saving
            itemDetailsRef.current[key] = item;
          });
        });
        setMasterItems(
          Object.values(masterMap).sort((a, b) => a.itemName.localeCompare(b.itemName))
        );
      })
      .catch(() => { setMasterItems([]); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, shipments.length, getShipmentSum]);

  // ── Lazy-fetch volunteer entries when a shipment tab is activated ──────────
  useEffect(() => {
    if (activeTab === 'master' || shipmentEntries[activeTab] !== undefined) return;
    getShipmentEntries(activeTab)
      .then(entries => {
        setShipmentEntries(prev => ({ ...prev, [activeTab]: entries }));
        // also cache item details from individual entries
        entries.forEach(e => {
          e.items.forEach(item => {
            const key = item.itemName.toLowerCase();
            if (!itemDetailsRef.current[key]) itemDetailsRef.current[key] = item;
          });
        });
      })
      .catch(() => setShipmentEntries(prev => ({ ...prev, [activeTab]: [] })));
  }, [activeTab, shipmentEntries, getShipmentEntries]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setActiveSubTab('sum');
  };

  const handleExport = () => {
    const headers = showPriceColumn
      ? ['Items', 'Count', 'Units', 'Category', '$/Unit']
      : ['Items', 'Count', 'Units', 'Category'];

    const rows = displayItems.map(item => {
      const price = localPrices[item.itemName.toLowerCase()] ?? '';
      return showPriceColumn
        ? [item.itemName, item.count, item.unit, item.category, price]
        : [item.itemName, item.count, item.unit, item.category];
    });

    const csvContent = [headers, ...rows]
      .map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    // Build a descriptive filename
    let filename = 'master';
    if (activeTab !== 'master') {
      const shipName = shipmentsInRange.find(s => s.id === activeTab)?.name ?? activeTab;
      filename = activeSubTab === 'sum' ? `${shipName}-sum` : `${shipName}-${activeSubTab}`;
    }
    if (from && to) filename += `_${from}_to_${to}`;
    filename += '.csv';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSavePrice = async () => {
    const entries = Object.entries(localPrices).filter(([, v]) => v !== '' && !isNaN(parseFloat(v)));
    if (entries.length === 0) { toast.error('No prices to save.'); return; }
    try {
      await Promise.all(
        entries.map(([key, val]) => {
          const details = itemDetailsRef.current[key];
          if (!details) return Promise.resolve();
          return upsertPrice(details.itemName, {
            unit: details.unit,
            dollarsPerUnit: parseFloat(val),
            updatedBy: user?.name || 'Bookkeeper',
          });
        })
      );
      toast.success('Prices saved!');
    } catch {
      toast.error('Failed to save prices. Please try again.');
    }
  };

  // ── Determine what rows to show ───────────────────────────────────────────
  let displayItems: EntryItem[];
  if (activeTab === 'master') {
    displayItems = masterItems;
  } else if (activeSubTab === 'sum') {
    displayItems = shipmentSums[activeTab] ?? [];
  } else {
    const entries = shipmentEntries[activeTab] ?? [];
    displayItems = entries.find(e => e.volunteerName === activeSubTab)?.items ?? [];
  }

  const showPriceColumn = activeTab === 'master' || activeSubTab === 'sum';
  const currentEntries  = activeTab !== 'master' ? (shipmentEntries[activeTab] ?? []) : [];

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'B';

  return (
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FDFFEC' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#F6F6F6', borderBottom: '1px solid #E0E0E0' }}>
        <button
          onClick={() => navigate('/bookkeeper')}
          className="flex items-center justify-center w-12 h-12 rounded-full hover:opacity-70"
          style={{ backgroundColor: '#BDBDBD', color: '#fff', fontSize: 22 }}
        >
          {'<'}
        </button>

        <div className="text-center">
          <p className="font-medium">Master Sheet</p>
          {from && to && (
            <p className="text-xs" style={{ color: '#6B6B6B' }}>{formatDate(from)} → {formatDate(to)}</p>
          )}
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#BDBDBD' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#BDBDBD' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ color: '#030303' }}>Bookkeeper</span>
        </div>
      </div>

      {/* ── Volunteer sub-tabs (only when a shipment tab is active) ── */}
      {activeTab !== 'master' && (
        <div style={{ borderBottom: '1px solid #EEEEEE', backgroundColor: '#FAFAFA' }}>
          <ScrollArea orientation="horizontal" className="w-full">
            <div className="flex min-w-max">
              <button
                onClick={() => setActiveSubTab('sum')}
                className="px-5 py-2 text-sm whitespace-nowrap"
                style={{
                  borderRight: '1px solid #EEEEEE',
                  backgroundColor: activeSubTab === 'sum' ? '#FDFFEC' : 'transparent',
                  fontWeight: activeSubTab === 'sum' ? 600 : 400,
                }}
              >
                Sum Sheet
              </button>
              {currentEntries.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => setActiveSubTab(entry.volunteerName)}
                  className="px-5 py-2 text-sm whitespace-nowrap"
                  style={{
                    borderRight: '1px solid #EEEEEE',
                    backgroundColor: activeSubTab === entry.volunteerName ? '#FDFFEC' : 'transparent',
                    fontWeight: activeSubTab === entry.volunteerName ? 600 : 400,
                  }}
                >
                  {entry.volunteerName}
                </button>
              ))}
              {currentEntries.length === 0 && (
                <span className="px-5 py-2 text-sm italic" style={{ color: '#AAAAAA' }}>
                  Loading volunteer entries…
                </span>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* ── Column headers ── */}
      <div className="px-3 py-2" style={{ backgroundColor: '#E0E0E0' }}>
        <div className="flex gap-px min-w-max">
          <div className="w-44 font-medium text-sm p-1">Items</div>
          <div className="w-24 font-medium text-sm p-1">Count</div>
          <div className="w-28 font-medium text-sm p-1">Units</div>
          <div className="w-32 font-medium text-sm p-1">Category</div>
          {showPriceColumn && (
            <div className="w-32 font-medium text-sm p-1">$/Unit</div>
          )}
        </div>
      </div>

      {/* ── Rows ── */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <ScrollArea orientation="horizontal" className="w-full">
            <div className="min-w-max">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Loading…</div>
              ) : shipmentsInRange.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No shipments found between {formatDate(from)} and {formatDate(to)}.
                  <br />
                  <span className="text-sm">
                    Make sure shipment dates fall within this range.
                  </span>
                </div>
              ) : displayItems.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No items logged yet.</div>
              ) : (
                displayItems.map((item, index) => {
                  const priceKey = item.itemName.toLowerCase();
                  return (
                    <div key={index} className="flex gap-px" style={{ borderBottom: '1px solid #EEEEEE', backgroundColor: '#EEEEEE' }}>
                      <div className="w-44 p-2 flex items-center text-sm" style={{ backgroundColor: index % 2 === 0 ? '#FDFFEC' : '#F6F6F6' }}>{item.itemName}</div>
                      <div className="w-24 p-2 flex items-center text-sm" style={{ backgroundColor: index % 2 === 0 ? '#FDFFEC' : '#F6F6F6' }}>{item.count}</div>
                      <div className="w-28 p-2 flex items-center text-sm" style={{ backgroundColor: index % 2 === 0 ? '#FDFFEC' : '#F6F6F6' }}>{item.unit}</div>
                      <div className="w-32 p-2 flex items-center text-sm" style={{ backgroundColor: index % 2 === 0 ? '#FDFFEC' : '#F6F6F6' }}>{item.category}</div>
                      {showPriceColumn && (
                        <div className="w-32 p-2" style={{ backgroundColor: index % 2 === 0 ? '#FDFFEC' : '#F6F6F6' }}>
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            placeholder="$0.00"
                            value={localPrices[priceKey] ?? ''}
                            onChange={e =>
                              setLocalPrices(prev => ({ ...prev, [priceKey]: e.target.value }))
                            }
                            className="border-none h-8 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* ── Bottom: shipment tab bar + save ── */}
      <div style={{ borderTop: '1px solid #EEEEEE' }}>
        <ScrollArea orientation="horizontal" className="w-full">
          <div className="flex min-w-max" style={{ backgroundColor: '#EEEEEE' }}>
            {/* Master tab */}
            <button
              onClick={() => switchTab('master')}
              className="px-6 py-4 whitespace-nowrap text-sm"
              style={{
                borderRight: '1px solid #BDBDBD',
                backgroundColor: activeTab === 'master' ? '#E0E0E0' : '#EEEEEE',
                fontWeight: activeTab === 'master' ? 600 : 400,
              }}
            >
              Master
            </button>

            {/* One tab per shipment in range */}
            {shipmentsInRange.map(shipment => (
              <button
                key={shipment.id}
                onClick={() => switchTab(shipment.id)}
                className="px-6 py-4 whitespace-nowrap text-sm"
                style={{
                  borderRight: '1px solid #BDBDBD',
                  backgroundColor: activeTab === shipment.id ? '#E0E0E0' : '#EEEEEE',
                  fontWeight: activeTab === shipment.id ? 600 : 400,
                }}
              >
                {shipment.name}
              </button>
            ))}

            {shipmentsInRange.length === 0 && !loading && (
              <span className="px-6 py-4 text-sm italic" style={{ color: '#AAAAAA' }}>No shipments in range</span>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="p-4 flex gap-3">
          <Button
            onClick={handleSavePrice}
            className="flex-1 h-14 text-black hover:opacity-80 font-normal text-lg"
            style={{ backgroundColor: '#E0E0E0' }}
          >
            Save Prices
          </Button>
          <Button
            onClick={handleExport}
            disabled={displayItems.length === 0}
            className="flex-1 h-14 text-white hover:opacity-90 disabled:opacity-50 font-normal text-lg"
            style={{ backgroundColor: '#9ABB39' }}
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
