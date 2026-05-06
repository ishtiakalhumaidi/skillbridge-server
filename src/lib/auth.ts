import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.SERVER_URL || "https://skillbridge-server-xi.vercel.app",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    "https://skillbridge-server-xi.vercel.app",
    "https://skillbridge-iah.vercel.app",
    "http://localhost:3000",
    "https://skillbridge-client-iota.vercel.app",
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: true,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
      },
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "None",
      secure: true,
      httpOnly: true,
      partitioned: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
  
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
          });

          if (user?.status === "banned") {
            throw new APIError("UNAUTHORIZED", {
              message:
                "Your account has been suspended. Please contact the SkillBridge helpline.",
            });
          }

          // Otherwise, proceed normally
          return { data: session };
        },
      },
    },
  },
});
