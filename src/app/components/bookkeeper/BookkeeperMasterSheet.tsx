import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function BookkeeperMasterSheet() {
  const navigate = useNavigate();
  const { sheetId } = useParams();
  const { user, addRecentlyViewed } = useUser();
  const { masterSheets, shipments } = useData();
  const [activeTab, setActiveTab] = useState<'master' | string>('master');

  const sheet = masterSheets.find(s => s.id === sheetId);

  useEffect(() => {
    if (sheet) {
      addRecentlyViewed({ id: sheet.id, name: sheet.name });
    }
  }, [sheet, addRecentlyViewed]);

  const handleBack = () => {
    navigate('/bookkeeper');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSave = () => {
    toast.success('Master sheet saved successfully!');
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'B';

  const allItems = shipments.flatMap(s => s.items);
  const uniqueItems = Array.from(new Set(allItems.map(i => i.itemName)));

  const displayItems = activeTab === 'master'
    ? allItems
    : shipments.find(s => s.id === activeTab)?.items || [];

  const displayUniqueItems = Array.from(new Set(displayItems.map(i => i.itemName)));

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

        <div className="text-center">
          <p className="text-sm text-gray-600">{sheet?.dateRange}</p>
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={handleProfileClick}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#9B9B9B' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#9B9B9B' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1">Bookkeeper</span>
        </div>
      </div>

      <div className="bg-gray-200 p-4 sticky top-0 z-10">
        <ScrollArea orientation="horizontal" className="w-full">
          <div className="flex gap-px min-w-max pb-1">
            <div className="w-40 font-medium bg-gray-200 p-2">Items</div>
            <div className="w-32 font-medium bg-gray-200 p-2">Count</div>
            <div className="w-32 font-medium bg-gray-200 p-2">Units</div>
            <div className="w-32 font-medium bg-gray-200 p-2">Category</div>
            <div className="w-32 font-medium bg-gray-200 p-2">Price/Unit</div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <ScrollArea orientation="horizontal" className="w-full">
            <div className="min-w-max pb-1">
              {displayUniqueItems.map((itemName, index) => {
                const item = displayItems.find(i => i.itemName === itemName);
                return (
                  <div key={index} className="flex gap-px bg-gray-200 border-b border-gray-300">
                    <div className="w-40 bg-white p-2">{itemName}</div>
                    <div className="w-32 bg-white p-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        defaultValue={item?.count || 0}
                        className="border-none h-8"
                      />
                    </div>
                    <div className="w-32 bg-white p-2">
                      <Input
                        type="text"
                        inputMode="text"
                        defaultValue={item?.unit || ''}
                        className="border-none h-8"
                      />
                    </div>
                    <div className="w-32 bg-white p-2">
                      <Input
                        type="text"
                        inputMode="text"
                        defaultValue={item?.category || ''}
                        className="border-none h-8"
                      />
                    </div>
                    <div className="w-32 bg-white p-2">
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        placeholder="$0.00"
                        className="border-none h-8"
                      />
                    </div>
                  </div>
                );
              })}
              {displayUniqueItems.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  No items in this period
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      <div className="border-t">
        <ScrollArea orientation="horizontal" className="w-full">
          <div className="flex bg-gray-200 min-w-max pb-1">
            <button
              onClick={() => setActiveTab('master')}
              className={`px-6 py-4 border-r border-gray-400 whitespace-nowrap ${
                activeTab === 'master' ? 'bg-gray-300 hover:bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Master
            </button>
            {shipments.map((shipment) => (
              <button
                key={shipment.id}
                onClick={() => setActiveTab(shipment.id)}
                className={`px-6 py-4 border-r border-gray-400 whitespace-nowrap ${
                  activeTab === shipment.id ? 'bg-gray-300 hover:bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {shipment.name}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="p-4">
          <Button
            onClick={handleSave}
            className="w-full h-16 bg-gray-300 hover:bg-gray-400 text-black"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
