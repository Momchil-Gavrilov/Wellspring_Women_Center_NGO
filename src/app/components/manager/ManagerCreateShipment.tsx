import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagerCreateShipment() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { addShipment } = useData();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleBack = () => {
    navigate('/manager');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleCreate = () => {
    if (!title || !date) {
      toast.error('Please fill in all fields');
      return;
    }

    addShipment({ name: title, date });
    toast.success('Shipment created successfully!');
    navigate('/manager');
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'M';

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
          <span className="text-sm mt-1">Manager</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-8 py-16">
        <h1 className="text-4xl mb-12">Create Shipment</h1>

        <div className="w-full max-w-lg space-y-6">
          <div>
            <label className="block mb-2">Title</label>
            <Input
              type="text"
              inputMode="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-200 border-none h-14"
              placeholder="Shipment title"
            />
          </div>

          <div>
            <label className="block mb-2">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-200 border-none h-14"
            />
          </div>

          <div className="pt-8">
            <Button
              onClick={handleCreate}
              className="w-full h-16 bg-gray-300 hover:bg-gray-400 text-black"
            >
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
