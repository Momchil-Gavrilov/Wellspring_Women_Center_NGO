import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  shipmentsApi, catalogApi, pricingApi,
  type Shipment, type CatalogItem, type PriceEntry, type EntryItem,
} from '../../services/api';

// ─── Context type ─────────────────────────────────────────────────────────────

interface DataContextType {
  // Shipments
  shipments: Shipment[];
  loadingShipments: boolean;
  addShipment: (data: { name: string; date: string; period?: string }) => Promise<void>;
  refreshShipments: () => Promise<void>;

  // Per-shipment entries (volunteer sheets + sum)
  saveVolunteerEntry: (shipmentId: string, volunteerName: string, items: EntryItem[]) => Promise<void>;
  getShipmentEntries: typeof shipmentsApi.getEntries;
  getShipmentSum: typeof shipmentsApi.getSum;

  // Catalog
  catalogItems: CatalogItem[];
  addCatalogItem: (item: Omit<CatalogItem, 'id' | 'standardized'>) => Promise<void>;
  updateCatalogItem: (id: string, data: Partial<CatalogItem>) => Promise<void>;
  removeCatalogItem: (id: string) => Promise<void>;
  refreshCatalog: () => Promise<void>;

  // Pricing (persisted $/unit — bookkeeper only)
  pricing: PriceEntry[];
  upsertPrice: (itemName: string, data: { unit: string; dollarsPerUnit: number; updatedBy?: string }) => Promise<void>;
  refreshPricing: () => Promise<void>;

  // Master sheets (bi-weekly periods — static for now)
  masterSheets: { id: string; name: string; dateRange: string }[];

  apiError: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const MASTER_SHEETS = [
  { id: 'current', name: 'Current (May 10-23)', dateRange: 'May 10-23, 2026' },
  { id: 'apr26-may9', name: 'Apr 26-May 9', dateRange: 'Apr 26-May 9, 2026' },
  { id: 'apr12-25', name: 'Apr 12-25', dateRange: 'Apr 12-25, 2026' },
  { id: 'mar29-apr11', name: 'Mar 29-Apr 11', dateRange: 'Mar 29-Apr 11, 2026' },
  { id: 'mar15-28', name: 'Mar 15-28', dateRange: 'Mar 15-28, 2026' },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [pricing, setPricing] = useState<PriceEntry[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // ─── Loaders ────────────────────────────────────────────────────────────────

  const refreshShipments = useCallback(async () => {
    try {
      setLoadingShipments(true);
      const data = await shipmentsApi.list();
      setShipments(data);
      setApiError(null);
    } catch {
      setApiError('Cannot reach server. Make sure the backend is running on port 5000.');
    } finally {
      setLoadingShipments(false);
    }
  }, []);

  const refreshCatalog = useCallback(async () => {
    try {
      const data = await catalogApi.list();
      setCatalogItems(data);
    } catch {
      // non-critical on load
    }
  }, []);

  const refreshPricing = useCallback(async () => {
    try {
      const data = await pricingApi.list();
      setPricing(data);
    } catch {
      // non-critical on load
    }
  }, []);

  useEffect(() => {
    refreshShipments();
    refreshCatalog();
    refreshPricing();
  }, [refreshShipments, refreshCatalog, refreshPricing]);

  // ─── Shipment mutations ──────────────────────────────────────────────────────

  const addShipment = useCallback(async (data: { name: string; date: string; period?: string }) => {
    const created = await shipmentsApi.create(data);
    setShipments(prev => [created, ...prev]);
  }, []);

  const saveVolunteerEntry = useCallback(
    (shipmentId: string, volunteerName: string, items: EntryItem[]) =>
      shipmentsApi.saveEntry(shipmentId, volunteerName, items),
    []
  );

  // ─── Catalog mutations ───────────────────────────────────────────────────────

  const addCatalogItem = useCallback(async (item: Omit<CatalogItem, 'id' | 'standardized'>) => {
    const created = await catalogApi.add(item);
    setCatalogItems(prev => [created, ...prev]);
  }, []);

  const updateCatalogItem = useCallback(async (id: string, data: Partial<CatalogItem>) => {
    const updated = await catalogApi.update(id, data);
    setCatalogItems(prev => prev.map(i => (i.id === id ? updated : i)));
  }, []);

  const removeCatalogItem = useCallback(async (id: string) => {
    await catalogApi.remove(id);
    setCatalogItems(prev => prev.filter(i => i.id !== id));
  }, []);

  // ─── Pricing mutations ───────────────────────────────────────────────────────

  const upsertPrice = useCallback(
    async (itemName: string, data: { unit: string; dollarsPerUnit: number; updatedBy?: string }) => {
      const updated = await pricingApi.upsert(itemName, data);
      setPricing(prev => {
        const idx = prev.findIndex(p => p.itemName === itemName);
        return idx >= 0 ? prev.map((p, i) => (i === idx ? updated : p)) : [updated, ...prev];
      });
    },
    []
  );

  return (
    <DataContext.Provider
      value={{
        shipments,
        loadingShipments,
        addShipment,
        refreshShipments,
        saveVolunteerEntry,
        getShipmentEntries: shipmentsApi.getEntries,
        getShipmentSum: shipmentsApi.getSum,
        catalogItems,
        addCatalogItem,
        updateCatalogItem,
        removeCatalogItem,
        refreshCatalog,
        pricing,
        upsertPrice,
        refreshPricing,
        masterSheets: MASTER_SHEETS,
        apiError,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
}
