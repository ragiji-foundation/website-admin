'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Title,
  Divider,
  Text,
  Container,
  Group,
  Switch,
  ColorInput,
  Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLock, IconMail, IconPalette, IconBrandTwitter } from '@tabler/icons-react';


interface Settings {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  logoUrl: string;
  contactEmail: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
  maintenance: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch settings',
        color: 'red',
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Passwords do not match',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      if (!response.ok) throw new Error('Failed to update password');

      notifications.show({
        title: 'Success',
        message: 'Password updated successfully',
        color: 'green',
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update password',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      notifications.show({
        title: 'Success',
        message: 'Settings updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update settings',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (

      <Container size="md" py="xl">
        <Title order={2} mb="xl">Settings</Title>

        <Tabs defaultValue="account">
          <Tabs.List mb="xl">
            <Tabs.Tab value="account" leftSection={<IconLock size={16} />}>
              Account
            </Tabs.Tab>
            <Tabs.Tab value="site" leftSection={<IconPalette size={16} />}>
              Site Settings
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="account">
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Title order={3} mb="lg">Change Password</Title>
              <form onSubmit={handlePasswordChange}>
                <Stack>
                  <PasswordInput
                    label="Current Password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })}
                  />
                  <PasswordInput
                    label="New Password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value
                    })}
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value
                    })}
                  />
                  <Button type="submit" loading={loading}>
                    Update Password
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="site">
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Title order={3} mb="lg">Site Settings</Title>
              {settings && (
                <form onSubmit={handleSettingsUpdate}>
                  <Stack>
                    <TextInput
                      label="Site Name"
                      value={settings.siteName}
                      onChange={(e) => setSettings({
                        ...settings,
                        siteName: e.target.value
                      })}
                    />
                    <TextInput
                      label="Site Description"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({
                        ...settings,
                        siteDescription: e.target.value
                      })}
                    />
                    <TextInput
                      label="Contact Email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        contactEmail: e.target.value
                      })}
                    />
                    <ColorInput
                      label="Primary Color"
                      value={settings.primaryColor}
                      onChange={(value) => setSettings({
                        ...settings,
                        primaryColor: value
                      })}
                    />
                    <TextInput
                      label="Logo URL"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({
                        ...settings,
                        logoUrl: e.target.value
                      })}
                    />
                    <Divider label="Social Links" labelPosition="center" />
                    <TextInput
                      label="Twitter"
                      value={settings.socialLinks.twitter}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialLinks: {
                          ...settings.socialLinks,
                          twitter: e.target.value
                        }
                      })}
                    />
                    <TextInput
                      label="Facebook"
                      value={settings.socialLinks.facebook}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialLinks: {
                          ...settings.socialLinks,
                          facebook: e.target.value
                        }
                      })}
                    />
                    <TextInput
                      label="Instagram"
                      value={settings.socialLinks.instagram}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialLinks: {
                          ...settings.socialLinks,
                          instagram: e.target.value
                        }
                      })}
                    />
                    <Switch
                      label="Maintenance Mode"
                      checked={settings.maintenance}
                      onChange={(e) => setSettings({
                        ...settings,
                        maintenance: e.currentTarget.checked
                      })}
                    />
                    <Button type="submit" loading={loading}>
                      Save Settings
                    </Button>
                  </Stack>
                </form>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Container>

  );
} 