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
      style={{ backgroundColor: '#FDFFEC' }}>

      {/* Decorative stars – matching Figma asterisk placement */}
      <Star top="5%" left="14%" size={96} color="#FAA308" opacity={1} />
      <Star top="3%" right="8%" size={96} color="#FAA308" opacity={1} />
      <Star top="0"  right="22%" size={96} color="#FAA308" opacity={1} />
      <Star top="10%" left="38%" size={96} color="#FAA308" opacity={1} />
      <Star top="18%" left="4%"  size={48} color="#FAA308" opacity={1} />
      <Star top="28%" right="0"  size={48} color="#FAA308" opacity={1} />

      <Star top="2%"  left="4%"  size={48} color="#9ABB39" opacity={1} />
      <Star top="15%" left="30%" size={64} color="#9ABB39" opacity={1} />
      <Star top="1%"  right="0"  size={64} color="#9ABB39" opacity={1} />

      <div className="w-full max-w-sm px-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="font-normal leading-tight" style={{ fontFamily: 'Inter, sans-serif', fontSize: 36, color: '#000' }}>
            Wellspring
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, color: '#000' }}>
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
            className="border-none h-14 text-base rounded-none"
            style={{ backgroundColor: '#D9D9D9', fontSize: 15, color: '#727272' }}
          />

          <Input
            type="password"
            inputMode="text"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="border-none h-14 text-base rounded-none"
            style={{ backgroundColor: '#D9D9D9', fontSize: 15, color: '#727272' }}
          />

          <Button
            onClick={handleLogin}
            className="w-full h-14 text-black hover:opacity-80 rounded-none font-normal text-2xl"
            style={{ backgroundColor: '#CACACA' }}
          >
            Log In
          </Button>

          <div className="border-t my-4" style={{ borderColor: '#A1A1A1' }} />

          <p className="text-center text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#000' }}>
            Don't have an account?
          </p>

          <Button
            onClick={() => navigate('/onboarding')}
            className="w-full h-14 text-black hover:opacity-80 rounded-none font-normal text-2xl"
            style={{ backgroundColor: '#CACACA' }}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
