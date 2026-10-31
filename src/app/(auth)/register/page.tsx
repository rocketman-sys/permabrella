import { safeReturnPath } from "@/lib/auth/return-path";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage({ searchParams }: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;
  return <RegisterForm callbackUrl={safeReturnPath(typeof callbackUrl === "string" ? callbackUrl : null)} />;
}
