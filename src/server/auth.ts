import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  playerProfiles,
} from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts as any, // eslint-disable-line
    sessionsTable: sessions as any, // eslint-disable-line
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: 'jwt',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM ?? 'Birdieboard <noreply@birdieboard.app>',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      // On initial sign-in, user object is present
      if (user?.id) {
        token.id = user.id as string;

        // Check whether a player_profile exists for this user
        const profile = await db
          .select({ id: playerProfiles.id })
          .from(playerProfiles)
          .where(eq(playerProfiles.userId, user.id))
          .limit(1);

        token.hasProfile = profile.length > 0;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.hasProfile = token.hasProfile as boolean;
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) return isLoggedIn;

      return true;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      // hasProfile check is handled in the jwt callback.
      // Redirect logic is handled in middleware.
      void user;
      void isNewUser;
    },
  },
});
