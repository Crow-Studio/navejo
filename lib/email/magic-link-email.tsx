import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface MagicLinkEmailProps {
  magicLink: string;
}

export const MagicLinkEmail = ({ magicLink }: MagicLinkEmailProps) => (
  <Html>
      <Head />
      <Preview>Your magic link for Events Palour</Preview>
      <Body style={main}>
          <Container style={container}>
              <Section>
                  <Text style={heading}>Let&apos;s get you signed in</Text>
                  <Text style={text}>
                      Click the button below to sign in to your account. This link will expire in 10 minutes.
                  </Text>
                  <Button
                      style={{
                          ...button,
                          paddingLeft: 20,
                          paddingRight: 20,
                          paddingTop: 12,
                          paddingBottom: 12,
                      }}
                      href={magicLink}
                  >
                      Sign in to Events Palour
                  </Button>
                  <Text style={text}>
                      If you didn&apos;t request this email, you can safely ignore it.
                  </Text>
              </Section>
          </Container>
      </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
};

// New heading style for the welcome text
const heading = {
  fontSize: "20px",
  lineHeight: "32px",
  color: "#333",
  fontWeight: "bold" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
};

export default MagicLinkEmail;