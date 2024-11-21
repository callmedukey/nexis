import NextAuth, { DefaultSession } from "next-auth";
import kakao from "next-auth/providers/kakao";
import naver from "next-auth/providers/naver";

import prisma from "@/lib/db/prisma";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      provider: string;
      id: string;
      isAdmin: boolean;
      email: string;
      phone: string;
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }

  interface Profile {
    isAdmin?: boolean;
    response?: {
      email: string | undefined;
      mobile: string | undefined;
    };
  }
  interface User {
    isAdmin?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [kakao, naver],
  callbacks: {
    jwt({ token, account, profile, user }) {
      if (account?.provider === "naver" || account?.provider === "kakao") {
        token.userId = account?.providerAccountId as string;
        token.provider = account?.provider;
        token.isAdmin = user?.isAdmin || false;

        if (account?.provider === "naver") {
          token.email = profile?.response?.email as string;
          token.phone = profile?.response?.mobile as string;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.provider = token.provider as string;
      session.user.email = token.email as string;
      session.user.phone = token.phone as string;
      session.user.isAdmin = token.isAdmin as boolean;

      return session;
    },
    async signIn({ account, user, profile }) {
      // this happens first upon sign in
      if (account?.provider === "naver" || account?.provider === "kakao") {
        const userId = account?.providerAccountId as string;

        const foundUser = await prisma.user.findUnique({
          where: {
            providerId: userId,
          },
        });

        if (!foundUser) {
          await prisma.user.create({
            data: {
              providerId: userId,
              provider: account?.provider as string,
            },
          });
        }

        if (foundUser?.isAdmin && profile) {
          profile.isAdmin = true;
          user.isAdmin = true;
        }

        return true;
      }

      return false;
    },
  },
});
