import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string; verified?: string }>;
}) {
  const { callbackUrl, registered, verified } = await searchParams;
  return (
    <SignInForm
      callbackUrl={callbackUrl ?? "/dashboard"}
      registered={registered === "true"}
      verified={verified === "true"}
    />
  );
}
