import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

let activeProfileFetch = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (activeProfileFetch && activeProfileFetch.userId === authUserId) {
      try {
        const data = await activeProfileFetch.promise;
        setUser(data);
        setRole(data.role);
        setClientId(data.clientId);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    const fetchPromise = supabase
      .from('adminUsers')
      .select('*')
      .eq('authUserId', authUserId)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      });

    activeProfileFetch = { userId: authUserId, promise: fetchPromise };

    try {
      const data = await fetchPromise;
      setUser(data);
      setRole(data.role);
      
      // If the user is a Super Admin, fetch the first client as default, otherwise use their assigned clientId
      if (data.role === 'Super Admin') {
        const { data: firstClient, error: clientError } = await supabase
          .from('clientsDetails')
          .select('clientId')
          .order('clientId', { ascending: true })
          .limit(1)
          .single();
          
        if (!clientError && firstClient) {
          setClientId(firstClient.clientId);
        } else {
          setClientId(data.clientId); // fallback to assigned if error
        }
      } else {
        setClientId(data.clientId);
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      if (process.env.NODE_ENV === 'development') {
         setClientId('CLT0001'); // Fallback to dummy data client
         setRole('Super Admin'); // Default dev role to Super Admin to test features
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
    setClientId, // Exported to allow switching clients
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
