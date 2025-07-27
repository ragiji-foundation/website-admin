import { NextRequest } from 'next/server';
import { 
  apiSuccess, 
  apiError,
  handleOptions, 
  withApiHandler
} from '@/utils/centralized';

interface ContactInfo {
  id: string;
  type: 'email' | 'phone' | 'address' | 'hours';
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Default contact information
const defaultContactInfo: ContactInfo[] = [
  {
    id: '1',
    type: 'email',
    title: 'Email',
    titleHi: 'ईमेल',
    description: 'contact@ragijifoundation.com',
    descriptionHi: 'contact@ragijifoundation.com',
    icon: 'IconAt',
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    type: 'phone',
    title: 'Phone',
    titleHi: 'फोन',
    description: '+91 98765 43210',
    descriptionHi: '+91 98765 43210',
    icon: 'IconPhone',
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    type: 'address',
    title: 'Address',
    titleHi: 'पता',
    description: 'New Delhi, India',
    descriptionHi: 'नई दिल्ली, भारत',
    icon: 'IconMapPin',
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    type: 'hours',
    title: 'Working Hours',
    titleHi: 'कार्य समय',
    description: '9 AM – 6 PM (Mon-Fri)',
    descriptionHi: '9 बजे – 6 बजे (सोम-शुक्र)',
    icon: 'IconSun',
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const GET = withApiHandler(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    // For now, return default data
    // In future, this could be stored in database
    const localizedContactInfo = defaultContactInfo.map(item => ({
      ...item,
      title: locale === 'hi' && item.titleHi ? item.titleHi : item.title,
      description: locale === 'hi' && item.descriptionHi ? item.descriptionHi : item.description,
    }));

    return apiSuccess(localizedContactInfo.filter(item => item.isActive));
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return apiError('Failed to fetch contact information', 500);
  }
});

export const OPTIONS = handleOptions;
