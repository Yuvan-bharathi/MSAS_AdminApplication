import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAdminProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAdminProfile(session.user.id);
      } else {
        setUser(null);
        setRole(null);
        setClientId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchAdminProfile(authUserId) {
    try {
      const { data, error } = await supabase
        .from('adminUsers')
        .select('*')
        .eq('authUserId', authUserId)
        .single();

      if (error) throw error;

      setUser(data);
      setRole(data.role);
      setClientId(data.clientId);
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      // For development fallback if no adminUser exists for this authUser
      if (process.env.NODE_ENV === 'development') {
         setClientId('CLT0001'); // Fallback to dummy data client
         setRole('Admin');
         setUser({ name: 'Dev Admin' });
      }
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    role,
    clientId,
    loading,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
