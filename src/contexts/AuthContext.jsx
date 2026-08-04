import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

let activeProfileFetch = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track when the last order was inserted/updated via WebSockets
  const [lastOrderUpdate, setLastOrderUpdate] = useState(0);

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
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error;
        if (!data) throw new Error('No admin user found for this auth ID');
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
    lastOrderUpdate, // Exposed so tables can automatically refetch
    signOut: () => supabase.auth.signOut(),
  };

  /* 
   * 📡 REALTIME WEBSOCKET: Listen for new orders from customers
   */
  useEffect(() => {
    // Only listen if we have a resolved clientId
    if (!clientId) return;

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `clientId=eq.${clientId}`
        },
        (payload) => {
          console.log('New order received!', payload);
          const { mealType, quantity } = payload.new;
          toast.success(`New order received: ${quantity}x ${mealType}!`);
          setLastOrderUpdate(prev => prev + 1); // Trigger table refetches
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
