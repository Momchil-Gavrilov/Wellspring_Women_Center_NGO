import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { ArrowLeft } from 'lucide-react';

export default function BookkeeperSelectSheet() {
  const navigate = useNavigate();
  const { user, getRecentlyViewed, addRecentlyViewed } = useUser();
  const { masterSheets } = useData();
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  const handleBack = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleGo = () => {
    if (selectedSheet) {
      const sheet = masterSheets.find(s => s.id === selectedSheet);
      if (sheet) {
        addRecentlyViewed({ id: sheet.id, name: sheet.name });
      }
      navigate(`/bookkeeper/master-sheet/${selectedSheet}`);
    }
  };

  const handleRecentClick = (sheetId: string, sheetName: string) => {
    addRecentlyViewed({ id: sheetId, name: sheetName });
    navigate(`/bookkeeper/master-sheet/${sheetId}`);
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'B';

  const recentlyViewed = getRecentlyViewed();

  return (
    <div className="size-full bg-white flex flex-col">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="w-12 h-12 hover:opacity-80"
          style={{ backgroundColor: '#9B9B9B' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Button>

        <div className="flex flex-col items-center cursor-pointer" onClick={handleProfileClick}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#9B9B9B' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#9B9B9B' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1">Bookkeeper</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-8 pt-16">
        <h1 className="text-4xl mb-12">Select Master Sheet</h1>

        <div className="w-full max-w-lg space-y-6">
          <Select value={selectedSheet} onValueChange={setSelectedSheet}>
            <SelectTrigger className="h-16 bg-gray-200 border-none">
              <SelectValue placeholder="Choose a master sheet" />
            </SelectTrigger>
            <SelectContent>
              {masterSheets.map(sheet => (
                <SelectItem key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleGo}
            disabled={!selectedSheet}
            className="w-full h-16 bg-gray-300 hover:bg-gray-400 text-black disabled:opacity-50"
          >
            Go
          </Button>

          {recentlyViewed.length > 0 && (
            <div className="mt-8">
              <div className="bg-gray-100 px-4 py-3 mb-2">
                <p className="text-gray-600">Recently Viewed</p>
              </div>
              <div className="bg-white border border-gray-200">
                {recentlyViewed.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleRecentClick(item.id, item.name)}
                    className={`w-full text-left px-4 py-3 text-gray-400 hover:bg-gray-50 ${
                      index < recentlyViewed.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
