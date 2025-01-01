import { NextResponse } from 'next/server';

export async function GET() {
  const links = [
    { link: '/', label: 'HOME' },
    {
      link: '#1',
      label: 'ABOUT US',
      links: [
        { link: '/pages/the-need', label: 'THE NEED' },
        { link: '/pages/our-story', label: 'OUR STORY' },
        { link: '/pages/our-initiatives', label: 'OUR INITIATIVES' },
        { link: '/pages/success-stories', label: 'SUCCESS STORIES' },
      ],
    },
    { link: '/pages/awards', label: 'AWARDS' },
    {
      link: '#2',
      label: 'MEDIA',
      links: [
        { link: '/pages/news-coverage', label: 'NEWS COVERAGE' },
        { link: '/pages/blog', label: 'BLOGS' },
        { link: '/pages/electronic-media', label: 'ELECTRONIC MEDIA' },
      ],
    },
    { link: '/pages/contact-us', label: 'CONTACT US' },
    { link: '/pages/career', label: 'CAREERS' }
  ];

  return NextResponse.json({ links });
} 