import * as React from 'react';
import { Html, Head, Body, Container, Text, Hr } from '@react-email/components';

interface OtpEmailProps {
  username: string;
  code: string;
}

export const OtpEmail = ({ username, code }: OtpEmailProps) => {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=K2D:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body
        style={{
          fontFamily: '"K2D" , Arial, sans-serif',
          backgroundColor: '#f4f4f4',
          padding: '20px',
        }}
      >
        <Container
          style={{
            maxWidth: '400px',
            backgroundColor: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            textAlign: 'center',
            borderRadius: '5px',
          }}
        >
          <Text style={{ fontSize: '18px' }}>Hello {username},</Text>
          <Hr className="my-[16px] border-t-2 border-gray-300 w-full" />
          <Text
            style={{
              fontSize: '16px',
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            Your OTP code for Unichub is:
            <Text
              style={{
                fontSize: '24px',
                backgroundColor: '#000000',
                color: 'white',
                padding: '20px',
                borderRadius: '15px',
              }}
            >
              {code}
            </Text>
          </Text>
          <Text>Please use this code to complete your login process.</Text>
        </Container>
      </Body>
    </Html>
  );
};
