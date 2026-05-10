import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useUser } from '../context/UserContext';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username || !password) return;

    let role: 'volunteer' | 'manager' | 'bookkeeper' = 'volunteer';

    if (username.toLowerCase().includes('manager')) {
      role = 'manager';
    } else if (username.toLowerCase().includes('bookkeeper') || username.toLowerCase().includes('book')) {
      role = 'bookkeeper';
    }

    setUser({ name: username, role });

    if (role === 'volunteer') {
      navigate('/volunteer');
    } else if (role === 'manager') {
      navigate('/manager');
    } else {
      navigate('/bookkeeper');
    }
  };

  const handleSignUp = () => {
    navigate('/onboarding');
  };

  return (
    <div className="size-full flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#F5F1E8' }}>
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

      <div className="w-full max-w-md px-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-2" style={{ color: '#1F1F1F' }}>Wellspring</h1>
          <p className="text-xl" style={{ color: '#6B6B6B' }}>Women's Center</p>
        </div>

        <div className="space-y-6">
          <Input
            type="text"
            inputMode="text"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-none h-14 text-base"
            style={{ fontSize: '16px', backgroundColor: '#E8E8E8' }}
          />

          <Input
            type="password"
            inputMode="text"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-none h-14 text-base"
            style={{ fontSize: '16px', backgroundColor: '#E8E8E8' }}
          />

          <Button
            onClick={handleLogin}
            className="w-full h-14 text-black hover:opacity-90"
            style={{ backgroundColor: '#9B9B9B' }}
          >
            Log In
          </Button>

          <div className="border-t my-6" style={{ borderColor: '#C4C4C4' }} />

          <p className="text-center" style={{ color: '#1F1F1F' }}>Don't have an account?</p>

          <Button
            onClick={handleSignUp}
            className="w-full h-14 text-white hover:opacity-90"
            style={{ backgroundColor: '#F5A623' }}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
