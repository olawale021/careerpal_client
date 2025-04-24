import type { NextAuthOptions, User } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Define custom types
interface ExtendedUser extends User {
  jwt?: string;
  id: string;
  refreshToken?: string;
}

// Define session type
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id?: string;
      jwt?: string;
      refreshToken?: string;
    };
  }
}

// Auth options configuration
const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
          if (!backendUrl) {
            console.error("Backend URL not configured");
            return null;
          }

          const response = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          
          return {
            id: data.user_id,
            name: data.full_name,
            email: credentials.email,
            jwt: data.access_token,
            refreshToken: data.refresh_token,
          };
        } catch (error) {
          console.error("Credentials login error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          console.error("Backend URL not configured");
          return false;
        }

        console.log("Sending request to FastAPI:", {
          email: user.email,
          full_name: user.name,
          google_id: user.id,
        });

        const response = await fetch(`${backendUrl}/auth/google/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            full_name: user.name,
            google_id: user.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to authenticate with backend:", errorData);
          return false;
        }

        const { access_token, refresh_token, user_id } = await response.json();
        
        // Extend the user object
        const extendedUser = user as ExtendedUser;
        extendedUser.jwt = access_token;
        extendedUser.refreshToken = refresh_token;
        extendedUser.id = user_id;

        return true;
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.jwt = (user as ExtendedUser).jwt;
        token.refreshToken = (user as ExtendedUser).refreshToken;
      }
      
      // Handle token expiration and refresh
      if (token.jwt) {
        // Check if token is expired (this is a simplified check)
        const tokenExp = JSON.parse(atob((token.jwt as string).split('.')[1])).exp;
        const currentTime = Math.floor(Date.now() / 1000);
        
        // If token is expired or about to expire (within 5 minutes)
        if (tokenExp < currentTime + 300 && token.refreshToken) {
          try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const response = await fetch(`${backendUrl}/auth/refresh-token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: token.refreshToken }),
            });
            
            if (response.ok) {
              const refreshedTokens = await response.json();
              token.jwt = refreshedTokens.access_token;
              console.log("Successfully refreshed access token");
            } else {
              // If refresh failed, clear the tokens
              console.error("Failed to refresh token");
              token.jwt = undefined;
              token.refreshToken = undefined;
            }
          } catch (error) {
            console.error("Error refreshing token:", error);
            token.jwt = undefined;
            token.refreshToken = undefined;
          }
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.jwt = token.jwt as string;
        session.user.refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Create and export the route handler
const handler = NextAuth(options);
export { handler as GET, handler as POST };
