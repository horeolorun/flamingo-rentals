import { Resend } from "resend";

type OtpPurpose =
  | "SIGNUP"
  | "PASSWORD_RESET";

type SendOtpEmailArgs = {
  to: string;
  code: string;
  purpose: OtpPurpose;
};

export async function sendOtpEmail({
  to,
  code,
  purpose,
}: SendOtpEmailArgs) {
  const apiKey =
    process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const resend =
    new Resend(apiKey);

  const isPasswordReset =
    purpose ===
    "PASSWORD_RESET";

  const subject =
    isPasswordReset
      ? "Reset your Flamingo Rentals password"
      : "Verify your Flamingo Rentals email";

  const heading =
    isPasswordReset
      ? "Reset your password"
      : "Verify your email";

  const description =
    isPasswordReset
      ? "Use the code below to reset your Flamingo Rentals password."
      : "Use the code below to verify your Flamingo Rentals email address.";

  const from =
    process.env.EMAIL_FROM ??
    "Flamingo Rentals <onboarding@resend.dev>";

  const {
    data,
    error,
  } =
    await resend.emails.send({
      from,

      to: [to],

      subject,

      text: `${description}

Verification code: ${code}

This code expires in 10 minutes.

If you did not request this code, you can ignore this email.

Flamingo Rentals`,

      html: `
        <div
          style="
            font-family: Arial, Helvetica, sans-serif;
            max-width: 560px;
            margin: 0 auto;
            padding: 32px;
            color: #1f2937;
          "
        >
          <div
            style="
              font-size: 24px;
              font-weight: 700;
              color: #4f2a91;
              margin-bottom: 28px;
            "
          >
            Flamingo Rentals
          </div>

          <h1
            style="
              font-size: 26px;
              margin-bottom: 16px;
              color: #111827;
            "
          >
            ${heading}
          </h1>

          <p
            style="
              font-size: 16px;
              line-height: 1.6;
              color: #4b5563;
            "
          >
            ${description}
          </p>

          <div
            style="
              margin: 28px 0;
              padding: 24px;
              background: #f5f0fb;
              border-radius: 14px;
              text-align: center;
            "
          >
            <p
              style="
                margin: 0 0 10px;
                font-size: 13px;
                color: #6b7280;
              "
            >
              Your verification code
            </p>

            <div
              style="
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 8px;
                color: #4f2a91;
              "
            >
              ${code}
            </div>
          </div>

          <p
            style="
              font-size: 14px;
              line-height: 1.6;
              color: #6b7280;
            "
          >
            This code expires in 10 minutes.
          </p>

          <p
            style="
              font-size: 14px;
              line-height: 1.6;
              color: #6b7280;
            "
          >
            If you did not request this code,
            you can safely ignore this email.
          </p>

          <p
            style="
              margin-top: 30px;
              font-size: 14px;
              color: #9ca3af;
            "
          >
            Flamingo Rentals
          </p>
        </div>
      `,
    });

  if (error) {
    console.error(
      "Resend email error:",
      error
    );

    throw new Error(
      error.message ||
        "Unable to send email."
    );
  }

  return data;
}