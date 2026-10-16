import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    sessionVersion?: number;
  }

  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
