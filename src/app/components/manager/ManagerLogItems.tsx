import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { EntryItem } from '../../../services/api';

interface AllItem extends EntryItem {
  volunteerName: string;
  shipmentName: string;
  shipmentDate: string;
}

export default function ManagerLogItems() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { shipments, catalogItems, addCatalogItem, getShipmentEntries } = useData();

  const [allItems, setAllItems] = useState<AllItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AllItem | null>(null);

  // Fetch all entries across all shipments
  useEffect(() => {
    if (shipments.length === 0) return;
    Promise.all(
      shipments.map(s =>
        getShipmentEntries(s.id).then(entries =>
          entries.flatMap(entry =>
            entry.items.map(item => ({
              ...item,
              volunteerName: entry.volunteerName,
              shipmentName: s.name,
              shipmentDate: s.date,
            }))
          )
        ).catch(() => [] as AllItem[])
      )
    ).then(results => setAllItems(results.flat()));
  }, [shipments, getShipmentEntries]);

  const handleBack = () => navigate('/manager');
  const handleProfileClick = () => navigate('/profile');

  const handleEditItem = (item: AllItem) => {
    setSelectedItem(item);
    setNewItemName(item.itemName);
    setNewItemUnit(item.unit);
    setNewItemCategory(item.category);
    setDialogOpen(true);
  };

  const handleApproveItem = async (item: AllItem) => {
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

  const handleCreateNew = () => {
    setSelectedItem(null);
    setNewItemName('');
    setNewItemUnit('');
    setNewItemCategory('');
    setDialogOpen(true);
  };

  const handleCreateItem = async () => {
    if (!newItemName || !newItemUnit || !newItemCategory) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await addCatalogItem({
        name: newItemName,
        unit: newItemUnit,
        category: newItemCategory,
        description: `Added by ${user?.name || 'Manager'}`,
        postedBy: user?.name || 'Manager',
      });
      toast.success('Item added to catalog!');
      setNewItemName('');
      setNewItemUnit('');
      setNewItemCategory('');
      setDialogOpen(false);
      setSelectedItem(null);
    } catch {
      toast.error('Failed to add item. Please try again.');
    }
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'M';

  const catalogItemNames = catalogItems.map(c => c.name.toLowerCase());
  const unapprovedItems = allItems.filter(
    item =>
      !catalogItemNames.includes(item.itemName.toLowerCase()) &&
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="size-full bg-white flex flex-col">
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

        <h1 className="text-2xl" style={{ color: '#1F1F1F' }}>Items</h1>

        <div className="flex flex-col items-center cursor-pointer" onClick={handleProfileClick}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#9B9B9B' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#9B9B9B' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ color: '#1F1F1F' }}>Manager</span>
        </div>
      </div>

      <div className="p-4">
        <Input
          type="text"
          inputMode="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 border-none"
          style={{ backgroundColor: '#E8E8E8' }}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 pb-6 space-y-8">
          {unapprovedItems.length > 0 && (
            <div>
              <h2 className="text-lg mb-4 pb-2 border-b border-gray-900">Volunteer Additions</h2>
              <div className="space-y-4">
                {unapprovedItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 bg-gray-300 flex-shrink-0">
                      <AvatarFallback className="bg-gray-300 text-white text-sm">
                        {item.itemName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{item.itemName}</h3>
                          <p className="text-xs text-gray-400">{item.shipmentName} · {item.shipmentDate}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm text-gray-500 underline">
                            Posted by {item.volunteerName}
                          </span>
                          <Button
                            onClick={() => handleEditItem(item)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-black hover:opacity-80"
                            style={{ backgroundColor: '#C4C4C4' }}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleApproveItem(item)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:opacity-80"
                            style={{ backgroundColor: '#B8D35F' }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.count} {item.unit} · {item.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg mb-4 pb-2 border-b border-gray-900">Catalog of Items</h2>
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
                    <h3 className="text-2xl font-bold mb-3">{letter}</h3>
                    {items.map((item, index) => (
                      <div key={index} className="mb-4">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                ));
              })()}
              {catalogItems.length === 0 && (
                <div className="p-8 text-center text-gray-400">No items in catalog yet</div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          onClick={handleCreateNew}
          className="w-full h-16 text-white text-xl hover:opacity-90"
          style={{ backgroundColor: '#F5A623' }}
        >
          Create New
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-200">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center mb-6">
              {selectedItem ? 'Edit Item' : 'New Item'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Add or edit an item in the catalog
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="w-32 text-xl">Name of Item</label>
              <Input
                type="text"
                inputMode="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 bg-gray-300 border-none h-12"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-xl">Unit</label>
              <Input
                type="text"
                inputMode="text"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="flex-1 bg-gray-300 border-none h-12"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-xl">Category</label>
              <Input
                type="text"
                inputMode="text"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="flex-1 bg-gray-300 border-none h-12"
              />
            </div>
            <Button
              onClick={handleCreateItem}
              className="w-full h-14 hover:opacity-90 text-white text-xl"
              style={{ backgroundColor: '#9B9B9B' }}
            >
              {selectedItem ? 'Save' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
