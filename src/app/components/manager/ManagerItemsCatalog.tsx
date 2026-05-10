import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagerItemsCatalog() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { catalogItems, addCatalogItem } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBack = () => {
    navigate('/manager');
  };

  const handleProfileClick = () => {
    navigate('/profile');
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
        description: `${newItemUnit} of ${newItemCategory}`,
        postedBy: user?.name,
      });
      toast.success('Item created successfully!');
      setNewItemName('');
      setNewItemUnit('');
      setNewItemCategory('');
      setDialogOpen(false);
    } catch {
      toast.error('Failed to create item. Please try again.');
    }
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'M';

  const volunteerAdditions = catalogItems.filter(item => item.postedBy);
  const filteredCatalog = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCatalog = filteredCatalog.reduce((acc, item) => {
    const firstLetter = item.name[0].toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(item);
    return acc;
  }, {} as Record<string, typeof catalogItems>);

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

        <h1 className="text-2xl">Items</h1>

        <div className="flex flex-col items-center cursor-pointer" onClick={handleProfileClick}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#9B9B9B' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#9B9B9B' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1">Manager</span>
        </div>
      </div>

      <div className="p-4">
        <Input
          type="text"
          inputMode="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-100 border-gray-300"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 pb-4 space-y-8">
          {volunteerAdditions.length > 0 && (
            <div>
              <h2 className="text-xl mb-4 pb-2 border-b">Volunteer Additions</h2>
              <div className="space-y-4">
                {volunteerAdditions.map(item => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded">
                    <Avatar className="w-10 h-10 bg-gray-300">
                      <AvatarFallback className="bg-gray-300 text-white text-xs">
                        {item.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Posted by {item.postedBy}</span>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl mb-4 pb-2 border-b">Catalog of Items</h2>
            <div className="space-y-6">
              {Object.entries(groupedCatalog).map(([letter, items]) => (
                <div key={letter}>
                  <h3 className="text-2xl font-medium mb-3">{letter}</h3>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="pb-3 border-b">
                        <h4 className="font-medium mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-16 bg-gray-300 hover:bg-gray-400 text-black">
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-200">
            <DialogHeader>
              <DialogTitle className="text-3xl text-center mb-6">New Item</DialogTitle>
              <DialogDescription className="sr-only">
                Add a new item to the catalog with name, unit, and category
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
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
