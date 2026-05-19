import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import bcryptjs from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const passwordsMatch = await bcryptjs.compare(
          credentials.password,
          user.password
        );

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = (user as { emailVerified?: Date | null }).emailVerified
          ? new Date((user as { emailVerified?: Date | null }).emailVerified!).toISOString()
          : null;
      } else if (token.id && !token.emailVerified) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { emailVerified: true },
        });
        if (dbUser?.emailVerified) {
          token.emailVerified = dbUser.emailVerified.toISOString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; emailVerified?: string | null }).id = token.id as string;
        (session.user as { id?: string; emailVerified?: string | null }).emailVerified = token.emailVerified as string | null;
      }
      return session;
    },
  },
};
