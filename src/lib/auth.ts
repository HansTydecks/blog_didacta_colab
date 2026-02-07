import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-Mail und Passwort erforderlich");
        }

        const teacher = await prisma.teacher.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!teacher) {
          throw new Error("Ungültige Anmeldedaten");
        }

        const isPasswordValid = await compare(
          credentials.password,
          teacher.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Ungültige Anmeldedaten");
        }

        return {
          id: teacher.id,
          email: teacher.email,
          name: teacher.displayName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
      }
      return session;
    },
  },
};
