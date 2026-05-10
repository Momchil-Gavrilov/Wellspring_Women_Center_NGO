import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useUser } from '../context/UserContext';

// Decorative asterisk – matches the Figma star/flower motif
function Star({ top, left, right, bottom, size, color, opacity }: {
  top?: string; left?: string; right?: string; bottom?: string;
  size: number; color: string; opacity: number;
}) {
  return (
    <span
      className="absolute select-none pointer-events-none leading-none"
      style={{ top, left, right, bottom, fontSize: size, color, opacity, fontFamily: 'serif' }}
    >
      ✱
    </span>
  );
}

export default function LoginScreen() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username || !password) return;

    let role: 'volunteer' | 'manager' | 'bookkeeper' = 'volunteer';
    if (username.toLowerCase().includes('manager')) role = 'manager';
    else if (username.toLowerCase().includes('bookkeeper') || username.toLowerCase().includes('book')) role = 'bookkeeper';

    setUser({ name: username, role });
    navigate(role === 'volunteer' ? '/volunteer' : role === 'manager' ? '/manager' : '/bookkeeper');
  };

  return (
    <div className="size-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#FFFFFF' }}>

      {/* Decorative stars – minimal, professional */}
      <Star top="4%" left="6%"   size={56} color="#FAA308" opacity={1} />
      <Star top="3%" right="6%"  size={56} color="#9ABB39" opacity={1} />

      <div className="w-full max-w-sm px-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="font-normal leading-tight" style={{ fontSize: 36, color: '#000' }}>
            Wellspring
          </h1>
          <p style={{ fontSize: 24, color: '#000' }}>
            Women's Center
          </p>
        </div>

        <div className="space-y-5">
          <Input
            type="text"
            inputMode="text"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="border-none h-14 text-base"
            style={{ backgroundColor: '#EEEEEE', fontSize: 15, color: '#727272' }}
          />

          <Input
            type="password"
            inputMode="text"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="border-none h-14 text-base"
            style={{ backgroundColor: '#EEEEEE', fontSize: 15, color: '#727272' }}
          />

          <Button
            onClick={handleLogin}
            className="w-full h-14 text-white hover:opacity-80 font-normal text-2xl"
            style={{ backgroundColor: '#FAA308' }}
          >
            Log In
          </Button>

          <div className="border-t my-4" style={{ borderColor: '#BDBDBD' }} />

          <p className="text-center text-sm" style={{ color: '#000' }}>
            Don't have an account?
          </p>

          <Button
            onClick={() => navigate('/onboarding')}
            className="w-full h-14 text-white hover:opacity-80 font-normal text-2xl"
            style={{ backgroundColor: '#FAA308' }}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
