import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const { callbackUrl, registered } = await searchParams;
  return (
    <SignInForm
      callbackUrl={callbackUrl ?? "/dashboard"}
      registered={registered === "true"}
    />
  );
}
