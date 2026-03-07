import NextAuth from 'next-auth';
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
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
    ...authConfig.providers,
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
  callbacks: {
    ...authConfig.callbacks,
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      // On initial sign-in, user object is present — persist the user id
      if (user?.id) {
        token.id = user.id as string;
      }

      // Re-check hasProfile whenever it is not yet true.
      // This covers two cases:
      //   1. Initial sign-in (token.id just set above, hasProfile not yet written)
      //   2. Post-onboarding requests (hasProfile was false, profile now exists)
      // Once hasProfile is true it is never re-queried, so there is no extra
      // DB hit for users who have already completed onboarding.
      if (token.id && !token.hasProfile) {
        const profile = await db
          .select({ id: playerProfiles.id })
          .from(playerProfiles)
          .where(eq(playerProfiles.userId, token.id as string))
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
