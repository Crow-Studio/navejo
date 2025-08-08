// lib/email/invitation-template.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface InvitationEmailProps {
  invitedByName: string;
  invitedByEmail: string;
  organizationName: string;
  workspaceName?: string;
  inviteUrl: string;
  role: string;
}

export const InvitationEmail = ({
  invitedByName,
  invitedByEmail,
  organizationName,
  workspaceName,
  inviteUrl,
  role,
}: InvitationEmailProps) => {
  const previewText = `Join ${organizationName}${workspaceName ? ` - ${workspaceName}` : ''} on Navejo`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Navejo</Heading>
          </Section>
          
          {/* Main Content */}
          <Section style={content}>
            <Heading style={h2}>You&rsquo;re Invited!</Heading>
            
            <Text style={text}>
              <strong>{invitedByName}</strong> ({invitedByEmail}) has invited you to join their team on Navejo.
            </Text>
            
            {/* Invitation Details Card */}
            <Section style={invitationCard}>
              <Text style={{ ...text, margin: "0 0 16px", fontSize: "18px", fontWeight: "600" }}>
                Join {organizationName}
              </Text>
              {workspaceName && (
                <Text style={workspaceText}>
                  Workspace: {workspaceName}
                </Text>
              )}
              <Text style={{ ...smallText, margin: "16px 0 0" }}>
                Role: <strong style={{ color: "#ffffff" }}>{role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}</strong>
              </Text>
            </Section>
            
            {/* Features */}
            <Section style={featuresContainer}>
              <Text style={{ ...text, textAlign: "center", fontWeight: "600", margin: "0 0 24px" }}>
                What you&rsquo;ll get with Navejo:
              </Text>
              
              <div style={featureItem}>
                <div style={featureIcon}></div>
                <Text style={featureText}>
                  <strong>Smart Organization</strong> - Automatically categorize and organize your bookmarks
                </Text>
              </div>
              
              <div style={featureItem}>
                <div style={featureIcon}></div>
                <Text style={featureText}>
                  <strong>Team Collaboration</strong> - Share collections and collaborate on research projects
                </Text>
              </div>
              
              <div style={featureItem}>
                <div style={featureIcon}></div>
                <Text style={featureText}>
                  <strong>Real-time Sync</strong> - Keep your bookmarks synchronized across all devices
                </Text>
              </div>
            </Section>
            
            {/* Call to Action */}
            <Section style={buttonContainer}>
              <Button style={button} href={inviteUrl}>
                Accept Invitation
              </Button>
            </Section>
            
            {/* Alternative Link */}
            <Section style={linkContainer}>
              <Text style={{ ...smallText, textAlign: "center", margin: "0 0 12px" }}>
                Or copy and paste this URL into your browser:
              </Text>
              <Link href={inviteUrl} style={link}>
                {inviteUrl}
              </Link>
            </Section>
            
            <div style={divider}></div>
            
            <Text style={smallText}>
              Perfect for frontend engineers and designers who want to organize and share their most valuable resources.
            </Text>
          </Section>
          
          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This invitation will expire in 7 days.
            </Text>
            <Text style={{ ...footerText, margin: "0" }}>
              If you don&rsquo;t want to join this team, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#000000",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  margin: "0",
  padding: "0",
};

const container = {
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  backgroundColor: "#000000",
};

const header = {
  backgroundColor: "#080808",
  padding: "40px 32px",
  textAlign: "center" as const,
  borderBottom: "1px solid #020202",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0",
  letterSpacing: "-0.5px",
};

const content = {
  padding: "48px 32px",
  backgroundColor: "#000000",
};

const invitationCard = {
  backgroundColor: "#080808",
  border: "1px solid #020202",
  borderRadius: "12px",
  padding: "32px",
  margin: "32px 0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 16px",
  lineHeight: "1.3",
};

const workspaceText = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#f2f2f2",
  margin: "8px 0",
};

const text = {
  color: "#f2f2f2",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const smallText = {
  color: "#fdfdfd",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const button = {
  backgroundColor: "#ffffff",
  color: "#000000",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 32px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};

const linkContainer = {
  backgroundColor: "#080808",
  border: "1px solid #020202",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
};

const link = {
  color: "#f2f2f2",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const divider = {
  borderTop: "1px solid #020202",
  margin: "40px 0",
};

const footer = {
  backgroundColor: "#080808",
  padding: "32px",
  textAlign: "center" as const,
  borderTop: "1px solid #020202",
};

const footerText = {
  color: "#fdfdfd",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const featuresContainer = {
  margin: "32px 0",
};

const featureItem = {
  display: "flex",
  alignItems: "center",
  margin: "16px 0",
  padding: "16px",
  backgroundColor: "#080808",
  borderRadius: "8px",
  border: "1px solid #020202",
};

const featureIcon = {
  width: "24px",
  height: "24px",
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  marginRight: "16px",
  flexShrink: "0",
};

const featureText = {
  color: "#f2f2f2",
  fontSize: "14px",
  margin: "0",
};