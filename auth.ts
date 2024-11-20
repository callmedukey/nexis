import NextAuth, { DefaultSession } from "next-auth"
import kakao from "next-auth/providers/kakao"
import naver from "next-auth/providers/naver";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      provider: string
      id: string
      isAdmin: boolean
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"]
  }
}
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    kakao,
    naver,
  ],
  callbacks:{
    jwt({token,  account}){
      if (account?.provider === "naver" || account?.provider === "kakao"){
        token.userId = account?.providerAccountId as string;
        token.provider = account?.provider;
      }
      return token;
    },
    session({session,token }) {
      session.user.id = token.userId as string;
      session.user.provider = token.provider as string;
      return session;
    },
  },
});
