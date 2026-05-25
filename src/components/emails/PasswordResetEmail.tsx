import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  token: string;
}

export const PasswordResetEmail = ({ token }: PasswordResetEmailProps) => {
  const baseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const url = `${baseUrl}/reset-password/${token}`;

  return (
    <Html>
      <Head />
      <Preview>Reset your SecureGate password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>SecureGate</Heading>
          <Text style={text}>
            We received a request to reset your password. Click the button
            below to create a new password.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={url}>
              Reset Password
            </Button>
          </Section>
          <Text style={text}>
            This link will expire in 1 hour. If you did not request a password
            reset, you can safely ignore this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            SecureGate, Inc. • Security & Control Panel
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

const main = {
  backgroundColor: "#0b0f19",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#111827",
  border: "1px solid #1f2937",
  borderRadius: "8px",
  margin: "0 auto",
  padding: "30px",
  width: "480px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
};

const h1 = {
  color: "#3b82f6",
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 20px 0",
  letterSpacing: "0.05em",
};

const text = {
  color: "#9ca3af",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 20px 0",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "25px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#1f2937",
  margin: "20px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};
