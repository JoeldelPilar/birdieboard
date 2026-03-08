import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
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
import { compare } from 'bcryptjs';
import { signInCredentialsSchema } from '@/lib/validations/auth';
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
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validated = signInCredentialsSchema.safeParse(credentials);
        if (!validated.success) return null;

        const { email, password } = validated.data;

        const [user] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
            password: users.password,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;

        // Google-only users won't have a password set
        if (!user.password) return null;

        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
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
