
"use client";
import {
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import classes from './AuthenticationImage.module.css';
import { useState } from 'react';
import Image from 'next/image';

interface AuthenticationImageProps {
  onLogin: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function AuthenticationImage({ onLogin, isLoading, error }: AuthenticationImageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className={classes.wrapper}>
      <div className={classes.centerContainer}>
        <Paper className={classes.form} radius={0} p={30} ta="center">
          <Image
         
            src="/big_logo_ragijifoundation.png"
            alt="Ragiji Foundation Logo"
            className={classes.logo}
            width={250}
            height={250}
          />
          <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
            Login
          </Title>
          {error && <Text color="red">{error}</Text>}
          <TextInput
            label="Username"
            placeholder="Enter your username"
            size="md"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            mt="md"
            size="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            mt="xl"
            size="md"
            onClick={() => onLogin(username, password)}
            loading={isLoading}
          >
            Login
          </Button>
          <Text ta="center" mt="md">
            {/*Don't have an account?{' '}
            <Anchor href="#" fw={700} onClick={(event) => event.preventDefault()}>
              Register
            </Anchor>*/}
          </Text>
          {/* Developer Credit */}
          <div
            style={{
              position: 'fixed',
              left: 0,
              bottom: 0,
              width: '100%',
              background: '#fff',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
              zIndex: 100,
              padding: '16px 0',
            }}
          >
            <Text size="sm" style={{ color: '#4b5563', marginBottom: 8 }}>
              Developed by
            </Text>
            <a
              href="https://www.octavertexmedia.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#2563eb',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.color = '#1e40af')}
              onMouseOut={e => (e.currentTarget.style.color = '#2563eb')}
            >
              <Image
                src="/octavertexmedia.png"
                alt="OctacVertex Media"
                style={{ height: 24, width: 'auto' }}
                width={120}
                height={34}
              />
            </a>
          </div>
        </Paper>
      </div>
    </div>
  );
}