import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface RecentlyViewedItem {
  id: string;
  name: string;
}

interface User {
  name: string;
  role: 'volunteer' | 'manager' | 'bookkeeper';
  recentlyViewed?: RecentlyViewedItem[];
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  addRecentlyViewed: (item: RecentlyViewedItem) => void;
  getRecentlyViewed: () => RecentlyViewedItem[];
  addToRecentlyViewed: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addRecentlyViewed = useCallback((item: RecentlyViewedItem) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const current = currentUser.recentlyViewed || [];
      const filtered = current.filter(rv => rv.id !== item.id);
      const updated = [item, ...filtered].slice(0, 5);

      return {
        ...currentUser,
        recentlyViewed: updated,
      };
    });
  }, []);

  const addToRecentlyViewed = useCallback((id: string) => {
    addRecentlyViewed({ id, name: id });
  }, [addRecentlyViewed]);

  const getRecentlyViewed = useCallback(() => {
    return user?.recentlyViewed || [];
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, logout, addRecentlyViewed, addToRecentlyViewed, getRecentlyViewed }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
