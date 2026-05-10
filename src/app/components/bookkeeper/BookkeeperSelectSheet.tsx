import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useUser } from '../../context/UserContext';

function formatDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

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
  const [to, setTo]     = useState(defaults.to);

  const [recentRanges] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('bk_recent') || '[]'); }
    catch { return []; }
  });

  const handleGo = () => {
    if (!from || !to || from > to) return;
    const key = `${from}_${to}`;
    const updated = [key, ...recentRanges.filter(r => r !== key)].slice(0, 5);
    localStorage.setItem('bk_recent', JSON.stringify(updated));
    navigate(`/bookkeeper/master-sheet?from=${from}&to=${to}`);
  };

  const handleRecentClick = (key: string) => {
    const [f, t] = key.split('_');
    navigate(`/bookkeeper/master-sheet?from=${f}&to=${t}`);
  };

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'B';
  const isValid  = from && to && from <= to;

  return (
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FDFFEC' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#F6F6F6', borderBottom: '1px solid #E0E0E0' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-12 h-12 hover:opacity-70"
          style={{ backgroundColor: '#A1A1A1', color: '#fff', fontSize: 22, fontFamily: 'Inter, sans-serif' }}
        >
          {'<'}
        </button>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-16 h-16" style={{ backgroundColor: '#A1A1A1' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#A1A1A1' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif', color: '#030303' }}>Bookkeeper</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-start px-8 pt-12">
        <h1 className="font-normal mb-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: 32, color: '#000' }}>
          Master Sheet
        </h1>
        <p className="mb-10" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#6B6B6B' }}>
          Select a date range to view
        </p>

        <div className="w-full max-w-sm space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: '#6B6B6B' }}>From</label>
            <Input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="h-14 border-none rounded-none"
              style={{ backgroundColor: '#D9D9D9' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#6B6B6B' }}>To</label>
            <Input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="h-14 border-none rounded-none"
              style={{ backgroundColor: '#D9D9D9' }}
            />
          </div>

          {from > to && (
            <p className="text-sm" style={{ color: '#E57373' }}>"From" date must be before "To" date.</p>
          )}

          <Button
            onClick={handleGo}
            disabled={!isValid}
            className="w-full h-14 text-black hover:opacity-80 disabled:opacity-50 rounded-none font-normal text-2xl mt-2"
            style={{ backgroundColor: '#CACACA' }}
          >
            View Master Sheet
          </Button>
        </div>

        {/* Recently Viewed */}
        {recentRanges.length > 0 && (
          <div className="w-full max-w-sm mt-10">
            <div className="px-4 py-2" style={{ backgroundColor: '#E9E9E9' }}>
              <p className="text-center text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6B6B6B' }}>
                Recently Viewed
              </p>
            </div>
            <div style={{ backgroundColor: '#F2F2F2' }}>
              {recentRanges.map((key, index) => {
                const [f, t] = key.split('_');
                return (
                  <button
                    key={key}
                    onClick={() => handleRecentClick(key)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 20,
                      color: '#AAAAAA',
                      textDecoration: 'underline',
                      borderBottom: index < recentRanges.length - 1 ? '1px solid #D9D9D9' : 'none',
                    }}
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
