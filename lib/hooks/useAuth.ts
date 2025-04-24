import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const [isVerifying, setIsVerifying] = useState(false);
  // Comment out unused router
  // const router = useRouter();

  // Verify token on component mount or session change
  useEffect(() => {
    const verifyToken = async () => {
      if (session?.user?.jwt && status === 'authenticated') {
        setIsVerifying(true);
        try {
          const response = await fetch('/api/auth/verify-token');
          
          if (!response.ok) {
            // If verification fails, try to update the session
            // This will trigger the NextAuth JWT callback to refresh the token
            await update();
            
            // Check again after update
            const retryResponse = await fetch('/api/auth/verify-token');
            
            if (!retryResponse.ok) {
              // If still not valid after refresh attempt, sign out
              await signOut({ callbackUrl: '/login' });
            }
          }
        } catch (error) {
          console.error('Token verification error:', error);
        } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyToken();
  }, [session, status, update]);

  // Login function
  const login = async (provider: string) => {
    return signIn(provider, { callbackUrl: '/dashboard' });
  };

  // Logout function
  const logout = async () => {
    return signOut({ callbackUrl: '/login' });
  };

  return {
    session,
    status: isVerifying ? 'loading' : status,
    isAuthenticated: !!session?.user?.jwt && status === 'authenticated',
    login,
    logout,
    update,
  };
} 