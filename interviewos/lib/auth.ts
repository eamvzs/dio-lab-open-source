import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const isDemoMode =
  !process.env.GITHUB_CLIENT_ID ||
  process.env.GITHUB_CLIENT_ID === "your-github-client-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Demo mode: login sem OAuth
    ...(isDemoMode
      ? [
          Credentials({
            name: "Demo",
            credentials: {
              name: { label: "Nome", type: "text" },
            },
            async authorize(credentials) {
              const name = (credentials?.name as string) || "Dev Demo";
              const email = `demo-${Date.now()}@interviewos.dev`;

              const user = await prisma.user.upsert({
                where: { email: "demo@interviewos.dev" },
                update: { name },
                create: {
                  email: "demo@interviewos.dev",
                  name,
                  image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                },
              });

              return { id: user.id, name: user.name, email: user.email, image: user.image };
            },
          }),
        ]
      : [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]),
  ],
  session: {
    strategy: isDemoMode ? "jwt" : "database",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token, user }) {
      if (session.user) {
        session.user.id = (token?.id as string) || user?.id;
      }
      return session;
    },
  },
});

export const DEMO_MODE = isDemoMode;
