import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useUser } from '../context/UserContext';

function Star({ top, left, right, bottom, size, color }: {
  top?: string; left?: string; right?: string; bottom?: string;
  size: number; color: string;
}) {
  return (
    <span
      className="absolute select-none pointer-events-none leading-none"
      style={{ top, left, right, bottom, fontSize: size, color, fontFamily: 'serif' }}
    >
      ✱
    </span>
  );
}

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [name, setName] = useState('');

  const handleProceed = () => {
    if (!name) return;
    setUser({ name, role: 'volunteer' });
    navigate('/volunteer');
  };

  return (
    <div className="size-full flex items-center justify-center p-8 relative overflow-hidden"
      style={{ backgroundColor: '#FDFFEC' }}>

      {/* Decorative stars */}
      <Star top="5%"  left="14%" size={96} color="#FAA308" />
      <Star top="3%"  right="8%" size={96} color="#FAA308" />
      <Star top="18%" left="4%"  size={48} color="#FAA308" />
      <Star top="2%"  left="4%"  size={48} color="#9ABB39" />
      <Star top="15%" left="30%" size={64} color="#9ABB39" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="font-normal mb-3" style={{ fontSize: 32, color: '#000' }}>
            Welcome to Wellspring
          </h1>
          <p style={{ fontSize: 15, color: '#6B6B6B' }}>
            Please enter your name to get started
          </p>
        </div>

        <div className="space-y-5">
          <Input
            type="text"
            inputMode="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleProceed()}
            className="border-none h-14"
            style={{ backgroundColor: '#EEEEEE', fontSize: 15 }}
          />

          <Button
            onClick={handleProceed}
            disabled={!name}
            className="w-full h-14 text-black hover:opacity-80 disabled:opacity-50 font-normal text-2xl"
            style={{ backgroundColor: '#E0E0E0' }}
          >
            Proceed
          </Button>
        </div>
      </div>
    </div>
  );
}
