import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useUser } from '../context/UserContext';

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [password, setPassword]   = useState('');

  const isValid = firstName.trim() && lastName.trim() && password.trim();

  const handleProceed = () => {
    if (!isValid) return;
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    setUser({ name: fullName, role: 'volunteer' });
    navigate('/volunteer');
  };

  return (
    <div className="size-full flex items-center justify-center p-8"
      style={{ backgroundColor: '#FFFFFF' }}>

      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-normal mb-2" style={{ fontSize: 32, color: '#000' }}>
            Create Account
          </h1>
          <p style={{ fontSize: 15, color: '#6B6B6B' }}>
            Sign up to get started
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            inputMode="text"
            autoComplete="given-name"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleProceed()}
            className="border-none h-14"
            style={{ backgroundColor: '#EEEEEE', fontSize: 15 }}
          />

          <Input
            type="text"
            inputMode="text"
            autoComplete="family-name"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleProceed()}
            className="border-none h-14"
            style={{ backgroundColor: '#EEEEEE', fontSize: 15 }}
          />

          <Input
            type="password"
            inputMode="text"
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleProceed()}
            className="border-none h-14"
            style={{ backgroundColor: '#EEEEEE', fontSize: 15 }}
          />

          <Button
            onClick={handleProceed}
            disabled={!isValid}
            className="w-full h-14 text-black hover:opacity-80 disabled:opacity-50 font-normal text-xl"
            style={{ backgroundColor: '#E0E0E0' }}
          >
            Create Account
          </Button>

          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-sm underline"
            style={{ color: '#6B6B6B' }}
          >
            Already have an account? Log In
          </button>
        </div>
      </div>
    </div>
  );
}
