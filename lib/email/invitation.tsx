import {
    Body,
    Button,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface InviteEmailProps {
    userName?: string;
    senderName?: string;
    senderEmail?: string;
    organizationName?: string;
    organizationLogo?: string;
    inviteUrl?: string;
}

export const InviteEmail = ({
    userName = "User",
    senderName = "John Doe",
    senderEmail = "john@example.com",
    organizationName = "Company Name",
    organizationLogo = "",
    inviteUrl = "https://example.com/invite",
}: InviteEmailProps) => {
    const previewText = `Join ${senderName} on ${organizationName}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Join <strong>{senderName}</strong> on{" "}
                            <strong>{organizationName}</strong>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello there,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            <strong>{senderName}</strong> (
                            <Link
                                href={`mailto:${senderEmail}`}
                                className="text-green-600 no-underline"
                            >
                                {senderEmail}
                            </Link>
                            ) has invited you to join the <strong>{organizationName}</strong> team.
                        </Text>
                        <Section>
                            {organizationLogo && (
                                <Row>
                                    <Column align="left">
                                        <Img
                                            className="rounded-full"
                                            src={organizationLogo}
                                            width="64"
                                            height="64"
                                            fetchPriority="high"
                                        />
                                    </Column>
                                </Row>
                            )}
                        </Section>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={inviteUrl}
                            >
                                Join the team
                            </Button>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            or copy and paste this URL into your browser:{" "}
                            <Link href={inviteUrl} className="text-black no-underline">
                                {inviteUrl}
                            </Link>
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            This invitation was intended for{" "}
                            <span className="text-black">{userName}</span>. If you were not
                            expecting this invitation, you can ignore this email.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default InviteEmail;