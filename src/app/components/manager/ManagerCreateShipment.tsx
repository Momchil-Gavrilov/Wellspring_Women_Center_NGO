import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { toast } from 'sonner';

export default function ManagerCreateShipment() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { addShipment } = useData();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleCreate = async () => {
    if (!title || !date) { toast.error('Please fill in all fields'); return; }
    try {
      await addShipment({ name: title, date });
      toast.success('Shipment created successfully!');
      navigate('/manager');
    } catch {
      toast.error('Failed to create shipment. Please try again.');
    }
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'M';

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

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#BDBDBD' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#BDBDBD' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ color: '#030303' }}>Manager</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center px-8 py-14">
        <h1 className="font-normal mb-12" style={{ fontSize: 32, color: '#000' }}>
          Create Shipment
        </h1>

        <div className="w-full max-w-sm space-y-5">
          <div>
            <label className="block mb-2 text-sm" style={{ color: '#000' }}>Title</label>
            <Input
              type="text"
              inputMode="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="border-none h-14"
              style={{ backgroundColor: '#EEEEEE' }}
              placeholder="Shipment title"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm" style={{ color: '#000' }}>Date</label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border-none h-14"
              style={{ backgroundColor: '#EEEEEE' }}
            />
          </div>

          <div className="pt-6">
            <Button
              onClick={handleCreate}
              className="w-full h-14 text-black hover:opacity-80 font-normal text-2xl"
              style={{ backgroundColor: '#E0E0E0' }}
            >
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
