import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import { JWT } from "next-auth/jwt";

// Define extended user and session types
interface ExtendedUser extends User {
  jwt?: string;
  id: string;
}

interface ExtendedSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
    jwt?: string;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
          console.error("Backend URL not configured");
          return false;
        }

        console.log(" Sending request to FastAPI:", {
          email: user.email,
          full_name: user.name,
          google_id: user.id,
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google/callback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              full_name: user.name,
              google_id: user.id,
            }),
          }
        );

        const responseData = await response.json();
        console.log("FastAPI Response:", responseData);

        if (!response.ok) {
          console.error("Failed to authenticate with backend:", responseData);
          return false;
        }

        const { access_token, user_id } = responseData;
        
        // Ensure the user object includes the JWT and ID
        const extendedUser = user as ExtendedUser;
        extendedUser.jwt = access_token;
        extendedUser.id = user_id;

        return true;
      } catch (error) {
        console.error(" Google Sign-In Error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.jwt = (user as ExtendedUser)?.jwt;
        token.id = (user as ExtendedUser)?.id;
      }
      return token;
    },

    async session({ session, token }): Promise<ExtendedSession> {
      console.log("Setting session data with ID:", token.id);
      console.log("Current token state:", token);
    
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
