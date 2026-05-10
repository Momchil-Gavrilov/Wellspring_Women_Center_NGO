import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useUser } from '../context/UserContext';

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
    <div className="size-full flex items-center justify-center p-8 relative overflow-hidden" style={{ backgroundColor: '#F5F1E8' }}>
      {/* Decorative flowers */}
      <div className="absolute top-12 left-12 text-6xl" style={{ color: '#F5A623', opacity: 0.6 }}>✱</div>
      <div className="absolute top-20 right-24 text-5xl" style={{ color: '#F5A623', opacity: 0.5 }}>✱</div>
      <div className="absolute top-32 right-16 text-4xl" style={{ color: '#F5A623', opacity: 0.4 }}>✱</div>
      <div className="absolute bottom-32 left-16 text-5xl" style={{ color: '#F5A623', opacity: 0.5 }}>✱</div>
      <div className="absolute bottom-24 left-32 text-7xl" style={{ color: '#F5A623', opacity: 0.7 }}>✱</div>
      <div className="absolute top-40 left-24 text-5xl" style={{ color: '#F5A623', opacity: 0.5 }}>✱</div>
      <div className="absolute bottom-48 right-32 text-6xl" style={{ color: '#F5A623', opacity: 0.6 }}>✱</div>
      <div className="absolute top-1/3 left-20 text-4xl" style={{ color: '#B8D35F', opacity: 0.4 }}>✱</div>
      <div className="absolute top-1/4 right-1/4 text-5xl" style={{ color: '#B8D35F', opacity: 0.3 }}>✱</div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl mb-4" style={{ color: '#1F1F1F' }}>Welcome to Wellspring</h1>
          <p style={{ color: '#6B6B6B' }}>Please enter your name to get started</p>
        </div>

        <div className="space-y-6">
          <Input
            type="text"
            inputMode="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProceed()}
            className="border-none h-14 text-base"
            style={{ fontSize: '16px', backgroundColor: '#E8E8E8' }}
          />

          <Button
            onClick={handleProceed}
            disabled={!name}
            className="w-full h-14 text-white hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#F5A623' }}
          >
            Proceed to Shipment Page
          </Button>
        </div>
      </div>
    </div>
  );
}
