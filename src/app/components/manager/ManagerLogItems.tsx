import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { EntryItem, CatalogItem } from '../../../services/api';

interface AllItem extends EntryItem {
  volunteerName: string;
  shipmentName: string;
  shipmentDate: string;
}

type DialogMode = 'create' | 'approve' | 'edit-catalog';

export default function ManagerLogItems() {
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    shipments, catalogItems,
    addCatalogItem, updateCatalogItem, removeCatalogItem,
    getShipmentEntries,
  } = useData();

  const [allItems, setAllItems] = useState<AllItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Dialog state ─────────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen]               = useState(false);
  const [dialogMode, setDialogMode]               = useState<DialogMode>('create');
  const [pendingVolunteerItem, setPendingVolunteerItem] = useState<AllItem | null>(null);
  const [editingCatalogItem, setEditingCatalogItem]    = useState<CatalogItem | null>(null);
  const [newItemName, setNewItemName]             = useState('');
  const [newItemUnit, setNewItemUnit]             = useState('');
  const [newItemCategory, setNewItemCategory]     = useState('');
  const [submitting, setSubmitting]               = useState(false);

  // ── Fetch all volunteer entries across all shipments ──────────────────────
  useEffect(() => {
    if (shipments.length === 0) return;
    Promise.all(
      shipments.map(s =>
        getShipmentEntries(s.id)
          .then(entries =>
            entries.flatMap(entry =>
              entry.items.map(item => ({
                ...item,
                volunteerName: entry.volunteerName,
                shipmentName: s.name,
                shipmentDate: s.date,
              }))
            )
          )
          .catch(() => [] as AllItem[])
      )
    ).then(results => setAllItems(results.flat()));
  }, [shipments, getShipmentEntries]);

  // ── Dialog openers ────────────────────────────────────────────────────────
  const openApproveDialog = (item: AllItem) => {
    setPendingVolunteerItem(item);
    setEditingCatalogItem(null);
    setNewItemName(item.itemName);
    setNewItemUnit(item.unit);
    setNewItemCategory(item.category);
    setDialogMode('approve');
    setDialogOpen(true);
  };

  const openEditCatalogDialog = (item: CatalogItem) => {
    setEditingCatalogItem(item);
    setPendingVolunteerItem(null);
    setNewItemName(item.name);
    setNewItemUnit(item.unit);
    setNewItemCategory(item.category);
    setDialogMode('edit-catalog');
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCatalogItem(null);
    setPendingVolunteerItem(null);
    setNewItemName('');
    setNewItemUnit('');
    setNewItemCategory('');
    setDialogMode('create');
    setDialogOpen(true);
  };

  // ── Quick approve (checkmark button — no dialog) ───────────────────────────
  const handleApproveItem = async (item: AllItem) => {
    if (catalogItems.some(c => c.name.toLowerCase() === item.itemName.toLowerCase())) {
      toast.info(`${item.itemName} is already in the catalog.`);
      return;
    }
    try {
      await addCatalogItem({
        name: item.itemName,
        unit: item.unit,
        category: item.category,
        description: `Logged by ${item.volunteerName}`,
        postedBy: item.volunteerName,
      });
      toast.success(`${item.itemName} approved and added to catalog!`);
    } catch {
      toast.error('Failed to approve item. Please try again.');
    }
  };

  // ── Delete catalog item ───────────────────────────────────────────────────
  const handleDeleteCatalogItem = async (item: CatalogItem) => {
    try {
      await removeCatalogItem(item.id);
      toast.success(`${item.name} removed from catalog.`);
    } catch {
      toast.error('Failed to delete item. Please try again.');
    }
  };

  // ── Unified dialog save ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!newItemName.trim() || !newItemUnit.trim() || !newItemCategory.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      if (dialogMode === 'edit-catalog' && editingCatalogItem) {
        await updateCatalogItem(editingCatalogItem.id, {
          name: newItemName.trim(),
          unit: newItemUnit.trim(),
          category: newItemCategory.trim(),
        });
        toast.success('Item updated!');
      } else {
        if (catalogItems.some(c => c.name.toLowerCase() === newItemName.trim().toLowerCase())) {
          toast.info(`${newItemName.trim()} is already in the catalog.`);
          setDialogOpen(false);
          return;
        }
        await addCatalogItem({
          name: newItemName.trim(),
          unit: newItemUnit.trim(),
          category: newItemCategory.trim(),
          description:
            dialogMode === 'approve' && pendingVolunteerItem
              ? `Logged by ${pendingVolunteerItem.volunteerName}`
              : `Added by ${user?.name || 'Manager'}`,
          postedBy:
            dialogMode === 'approve' && pendingVolunteerItem
              ? pendingVolunteerItem.volunteerName
              : user?.name || 'Manager',
        });
        toast.success(
          dialogMode === 'approve'
            ? 'Item approved and added to catalog!'
            : 'Item added to catalog!'
        );
      }
      setDialogOpen(false);
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived lists ──────────────────────────────────────────────────────────
  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'M';
  const catalogItemNames = catalogItems.map(c => c.name.toLowerCase());
  const unapprovedItems = allItems.filter(
    item =>
      !catalogItemNames.includes(item.itemName.toLowerCase()) &&
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dialogTitle =
    dialogMode === 'edit-catalog' ? 'Edit Item'
    : dialogMode === 'approve'   ? 'Approve Item'
    : 'New Item';

  const dialogSaveLabel =
    dialogMode === 'edit-catalog' ? 'Save Changes'
    : dialogMode === 'approve'   ? 'Add to Catalog'
    : 'Create';

  return (
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FDFFEC' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#F6F6F6', borderBottom: '1px solid #E0E0E0' }}>
        <button
          onClick={() => navigate('/manager')}
          className="flex items-center justify-center w-12 h-12 rounded-full hover:opacity-70"
          style={{ backgroundColor: '#BDBDBD', color: '#fff', fontSize: 22 }}
        >
          {'<'}
        </button>

        <h1 className="font-normal" style={{ fontSize: 24, color: '#1F1F1F' }}>Items</h1>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#BDBDBD' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#BDBDBD' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ color: '#1F1F1F' }}>Manager</span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="p-4">
        <Input
          type="text"
          inputMode="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-12 border-none"
          style={{ backgroundColor: '#EEEEEE' }}
        />
      </div>

      {/* ── Content ── */}
      <ScrollArea className="flex-1">
        <div className="px-6 pb-6 space-y-8">

          {/* Volunteer Additions */}
          {unapprovedItems.length > 0 && (
            <div>
              <h2 className="text-lg mb-4 pb-2" style={{ borderBottom: '1px solid #1F1F1F' }}>
                Volunteer Additions
              </h2>
              <div className="space-y-4">
                {unapprovedItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0" style={{ backgroundColor: '#EEEEEE' }}>
                      <AvatarFallback className="text-white text-sm" style={{ backgroundColor: '#EEEEEE', color: '#6B6B6B' }}>
                        {item.itemName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm">{item.itemName}</h3>
                          <p className="text-xs" style={{ color: '#AAAAAA' }}>{item.shipmentName} · {item.shipmentDate}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs underline" style={{ color: '#6B6B6B' }}>
                            Posted by {item.volunteerName}
                          </span>
                          <Button
                            onClick={() => openApproveDialog(item)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-black hover:opacity-80"
                            style={{ backgroundColor: '#EEEEEE', fontSize: 12 }}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleApproveItem(item)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:opacity-80"
                            style={{ backgroundColor: '#9ABB39' }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>
                        {item.count} {item.unit} · {item.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catalog of Items */}
          <div>
            <h2 className="text-lg mb-4 pb-2" style={{ borderBottom: '1px solid #1F1F1F' }}>
              Catalog of Items
            </h2>
            <div className="space-y-4">
              {(() => {
                const filtered = catalogItems.filter(c =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                const grouped = filtered
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .reduce((acc, item) => {
                    const letter = item.name[0].toUpperCase();
                    if (!acc[letter]) acc[letter] = [];
                    acc[letter].push(item);
                    return acc;
                  }, {} as Record<string, typeof catalogItems>);

                return Object.entries(grouped).map(([letter, items]) => (
                  <div key={letter}>
                    <h3 className="text-2xl font-black mb-3">{letter}</h3>
                    {items.map(item => (
                      <div key={item.id} className="mb-4 flex items-start justify-between gap-2"
                        style={{ borderBottom: '1px solid #EEEEEE', paddingBottom: 12 }}>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-sm" style={{ color: '#6B6B6B' }}>{item.description}</p>
                          <p className="text-xs" style={{ color: '#AAAAAA' }}>{item.unit} · {item.category}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            onClick={() => openEditCatalogDialog(item)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:opacity-80"
                            style={{ backgroundColor: '#EEEEEE' }}
                            title="Edit item"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteCatalogItem(item)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:opacity-80"
                            style={{ backgroundColor: '#E57373' }}
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ));
              })()}
              {catalogItems.length === 0 && (
                <div className="p-8 text-center" style={{ color: '#AAAAAA' }}>No items in catalog yet</div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* ── Footer ── */}
      <div className="p-4" style={{ borderTop: '1px solid #EEEEEE' }}>
        <Button
          onClick={openCreateDialog}
          className="w-full h-14 text-black hover:opacity-80 font-normal text-2xl"
          style={{ backgroundColor: '#E0E0E0' }}
        >
          Create New
        </Button>
      </div>

      {/* ── Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={open => { if (!submitting) setDialogOpen(open); }}>
        <DialogContent style={{ backgroundColor: '#F0F0F0' }} className="">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center mb-4" style={{ fontWeight: 400 }}>
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Add or edit an item in the catalog
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {[
              { label: 'Name of Item', value: newItemName, set: setNewItemName },
              { label: 'Unit',         value: newItemUnit, set: setNewItemUnit },
              { label: 'Category',     value: newItemCategory, set: setNewItemCategory },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center gap-4">
                <label className="w-28 text-sm">{label}</label>
                <Input
                  type="text"
                  inputMode="text"
                  value={value}
                  onChange={e => set(e.target.value)}
                  className="flex-1 border-none h-10"
                  style={{ backgroundColor: '#E0E0E0' }}
                />
              </div>
            ))}
            <Button
              onClick={handleSave}
              disabled={submitting}
              className="w-full h-14 text-black hover:opacity-80 disabled:opacity-50 font-normal text-xl"
              style={{ backgroundColor: '#CACACA' }}
            >
              {submitting ? 'Saving…' : dialogSaveLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
