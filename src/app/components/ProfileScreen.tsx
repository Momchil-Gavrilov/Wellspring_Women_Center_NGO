import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useUser } from '../context/UserContext';
import { ArrowLeft } from 'lucide-react';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '??';

  const roleDisplay = user?.role.charAt(0).toUpperCase() + user?.role.slice(1) || 'Position';

  return (
    <div className="size-full bg-white">
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="w-12 h-12 hover:opacity-80"
          style={{ backgroundColor: '#9B9B9B' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center px-8 py-16">
        <Avatar className="w-40 h-40 mb-8" style={{ backgroundColor: '#9B9B9B' }}>
          <AvatarFallback className="text-4xl text-white" style={{ backgroundColor: '#9B9B9B' }}>
            {initials}
          </AvatarFallback>
        </Avatar>

        <h2 className="text-3xl mb-2">{user?.name || 'First Last Name'}</h2>
        <p className="text-xl text-gray-600 mb-12">{roleDisplay}</p>

        <Button
          onClick={handleLogout}
          className="w-full max-w-md h-14 bg-gray-300 hover:bg-gray-400 text-black"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
