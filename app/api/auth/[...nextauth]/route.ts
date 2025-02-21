
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { User } from "next-auth";

// Define custom types
interface ExtendedUser extends User {
  jwt?: string;
  id: string;
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

        const { access_token, user_id } = await response.json();
        
        // Extend the user object
        const extendedUser = user as ExtendedUser;
        extendedUser.jwt = access_token;
        extendedUser.id = user_id;

        return true;
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        // Add the custom fields from signIn
        token.jwt = (user as ExtendedUser).jwt;
        token.id = (user as ExtendedUser).id;
      }
      return token;
    },

    async session({ session, token }) {
      console.log("Setting session data with ID:", token.id);
      
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          jwt: token.jwt as string,
        },
      };
    },
  },
  pages: {
    signIn: '/google/login',  // Custom sign-in page (optional)
    error: '/auth/error',    // Custom error page (optional)
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Create and export the route handler
const handler = NextAuth(options);
export { handler as GET, handler as POST };