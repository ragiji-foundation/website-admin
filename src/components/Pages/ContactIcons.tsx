import { IconAt, IconMapPin, IconPhone, IconSun } from '@tabler/icons-react';
import { Box, Stack, Text } from '@mantine/core';
import { useApiData } from '@/hooks/useApiData';
import classes from './ContactIcons.module.css';

interface ContactIconProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  icon: typeof IconSun;
  title: React.ReactNode;
  description: React.ReactNode;
}

interface ContactInfo {
  id: string;
  type: 'email' | 'phone' | 'address' | 'hours';
  title: string;
  description: string;
  icon: string;
  order: number;
}

function ContactIcon({ icon: Icon, title, description, ...others }: ContactIconProps) {
  return (
    <div className={classes.wrapper} {...others}>
      <Box mr="md">
        <Icon size={24} />
      </Box>

      <div>
        <Text size="xs" className={classes.title}>
          {title}
        </Text>
        <Text className={classes.description}>{description}</Text>
      </div>
    </div>
  );
}

// ✅ FALLBACK DATA: Used only when API fails
const fallbackContactData: ContactInfo[] = [
  { 
    id: '1', 
    type: 'email', 
    title: 'Email', 
    description: 'contact@ragijifoundation.com', 
    icon: 'IconAt', 
    order: 1 
  },
  { 
    id: '2', 
    type: 'phone', 
    title: 'Phone', 
    description: '+91 98765 43210', 
    icon: 'IconPhone', 
    order: 2 
  },
  { 
    id: '3', 
    type: 'address', 
    title: 'Address', 
    description: 'New Delhi, India', 
    icon: 'IconMapPin', 
    order: 3 
  },
  { 
    id: '4', 
    type: 'hours', 
    title: 'Working Hours', 
    description: '9 AM – 6 PM (Mon-Fri)', 
    icon: 'IconSun', 
    order: 4 
  },
];

// Icon mapping
const iconMap = {
  IconAt,
  IconPhone,
  IconMapPin,
  IconSun
};

export function ContactIconsList() {
  // ✅ MIGRATED: Using centralized API data fetching
  const { data: contactInfo } = useApiData<ContactInfo[]>(
    '/api/contact-info', 
    fallbackContactData,
    { showNotifications: false } // Don't show notifications for this component
  );

  const items = contactInfo
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const IconComponent = iconMap[item.icon as keyof typeof iconMap] || IconAt;
      return (
        <ContactIcon 
          key={item.id} 
          icon={IconComponent}
          title={item.title}
          description={item.description}
        />
      );
    });

  return <Stack>{items}</Stack>;
}