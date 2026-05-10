import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useUser } from '../context/UserContext';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '??';

  const roleDisplay =
    (user?.role.charAt(0).toUpperCase() ?? '') + (user?.role.slice(1) ?? '') || 'Position';

  return (
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FDFFEC' }}>
      {/* No heavy header — matches Figma which has no header bar on the profile screen */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 gap-6">
        <Avatar className="w-44 h-44" style={{ backgroundColor: '#A1A1A1' }}>
          <AvatarFallback className="text-5xl text-white" style={{ backgroundColor: '#A1A1A1' }}>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h2 className="font-normal" style={{ fontFamily: 'Inter, sans-serif', fontSize: 32, color: '#030303' }}>
            {user?.name || 'First Last Name'}
          </h2>
          <p className="mt-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, color: '#030303' }}>
            {roleDisplay}
          </p>
        </div>

        <div className="w-full max-w-xs mt-4 flex flex-col gap-3">
          <Button
            onClick={handleLogout}
            className="w-full h-14 text-black hover:opacity-80 rounded-none font-normal text-2xl"
            style={{ backgroundColor: '#CACACA' }}
          >
            Log Out
          </Button>

          <button
            onClick={() => navigate(-1)}
            className="text-center text-sm underline"
            style={{ color: '#6B6B6B', fontFamily: 'Inter, sans-serif' }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
