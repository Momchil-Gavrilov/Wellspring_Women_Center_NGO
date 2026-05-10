import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useUser } from '../../context/UserContext';
import { ArrowLeft } from 'lucide-react';

// Format "2026-04-26" → "Apr 26, 2026"
function formatDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Compute a default: today and 14 days ago
function defaultDates() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 13);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { from: fmt(from), to: fmt(today) };
}

export default function BookkeeperSelectSheet() {
  const navigate = useNavigate();
  const { user } = useUser();

  const defaults = defaultDates();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);

  // Recently viewed stored as "from_to" strings
  const [recentRanges] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bk_recent') || '[]');
    } catch {
      return [];
    }
  });

  const handleGo = () => {
    if (!from || !to || from > to) return;
    // Persist to recently viewed
    const key = `${from}_${to}`;
    const updated = [key, ...recentRanges.filter(r => r !== key)].slice(0, 5);
    localStorage.setItem('bk_recent', JSON.stringify(updated));
    navigate(`/bookkeeper/master-sheet?from=${from}&to=${to}`);
  };

  const handleRecentClick = (key: string) => {
    const [f, t] = key.split('_');
    navigate(`/bookkeeper/master-sheet?from=${f}&to=${t}`);
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'B';

  const isValid = from && to && from <= to;

  return (
    <div className="size-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="w-12 h-12 hover:opacity-80"
          style={{ backgroundColor: '#9B9B9B' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Button>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#9B9B9B' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#9B9B9B' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1">Bookkeeper</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start px-8 pt-12">
        <h1 className="text-4xl mb-2">Master Sheet</h1>
        <p className="text-gray-500 mb-10">Select a date range to view</p>

        <div className="w-full max-w-lg space-y-4">
          {/* From date */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">From</label>
            <Input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="h-14 bg-gray-200 border-none"
            />
          </div>

          {/* To date */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">To</label>
            <Input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="h-14 bg-gray-200 border-none"
            />
          </div>

          {from > to && (
            <p className="text-red-500 text-sm">"From" date must be before "To" date.</p>
          )}

          <Button
            onClick={handleGo}
            disabled={!isValid}
            className="w-full h-16 bg-gray-300 hover:bg-gray-400 text-black disabled:opacity-50 mt-2"
          >
            View Master Sheet
          </Button>
        </div>

        {/* Recently viewed */}
        {recentRanges.length > 0 && (
          <div className="w-full max-w-lg mt-10">
            <div className="bg-gray-100 px-4 py-3 mb-2">
              <p className="text-gray-600 text-sm">Recently Viewed</p>
            </div>
            <div className="bg-white border border-gray-200 rounded">
              {recentRanges.map((key, index) => {
                const [f, t] = key.split('_');
                return (
                  <button
                    key={key}
                    onClick={() => handleRecentClick(key)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-600 ${
                      index < recentRanges.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    {formatDate(f)} → {formatDate(t)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
