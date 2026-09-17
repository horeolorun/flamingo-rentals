import LoginForm from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    verified?: string | string[];
    reset?: string | string[];
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  const verifiedValue = Array.isArray(
    params.verified
  )
    ? params.verified[0]
    : params.verified;

  const resetValue = Array.isArray(
    params.reset
  )
    ? params.reset[0]
    : params.reset;

  const wasVerified =
    verifiedValue === "1";

  const wasReset =
    resetValue === "1";

  return (
    <LoginForm
      wasVerified={wasVerified}
      wasReset={wasReset}
    />
  );
}