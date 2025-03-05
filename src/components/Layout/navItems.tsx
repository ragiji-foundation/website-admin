import React from 'react';
import {
  IconDashboard,
  IconFileText,
  IconCrop,
  IconPyramid,
  IconMailbox,
  IconQuote,
  IconTags,
  IconSettings,
  IconPlus,
  IconEdit,
  IconList,
  IconHome,
  IconAward,
  IconUsers,
  IconNews,
  IconMessage,
  IconBuildingCommunity,
  IconBriefcase,
  IconPhotoPlus,
  IconPhoto,
  IconUserPlus,
  IconLayoutNavbar,
  IconLayoutNavbarFilled,
  IconLayoutBottombarFilled,
} from '@tabler/icons-react';

export interface NavItem {
  link?: string;
  label?: string;
  icon?: React.ComponentType<any>;
  links?: NavItem[];
  divider?: boolean;
  dividerLabel?: string;
}

export const navItems: NavItem[] = [
  { link: '/', label: 'Dashboard', icon: IconDashboard },
  {
    link: '/blogs',
    label: 'Blogs',
    icon: IconFileText,
    links: [
      { link: '/blogs/create', label: 'Create Blog', icon: IconPlus },
      { link: '/blogs/drafts', label: 'Drafts', icon: IconEdit },
      { link: '/blogs', label: 'All Blogs', icon: IconList },
      {
        link: '/blogs/taxonomy',
        label: 'Taxonomy',
        icon: IconTags,
        links: [
          { link: '/blogs/taxonomy?type=categories', label: 'Categories', icon: IconTags },
          { link: '/blogs/taxonomy?type=tags', label: 'Tags', icon: IconTags }
        ]
      }
    ]
  },
  { divider: true },
  { link: '/banner', label: 'Banner', icon: IconCrop },
  { divider: true },
  { link: '/home', label: 'HOME', icon: IconHome },
  { divider: true, dividerLabel: 'ABOUT' },
  { link: '/the-need', label: 'THE NEED', icon: IconUsers },
  { link: '/our-story', label: 'OUR STORY', icon: IconMessage },
  { link: '/our-centers', label: 'OUR CENTERS', icon: IconBuildingCommunity },
  { link: '/our-initiatives', label: 'OUR INITIATIVES', icon: IconPhotoPlus },
  { link: '/success-stories', label: 'SUCCESS STORIES', icon: IconQuote },
  { divider: true, dividerLabel: 'MEDIA' },
  { link: '/awards', label: 'AWARDS', icon: IconAward },
  { link: '/news-coverage', label: 'NEWS COVERAGE', icon: IconNews },
  { link: '/blog', label: 'BLOGS', icon: IconFileText },
  { link: '/electronic-media', label: 'ELECTRONIC MEDIA', icon: IconPhoto },
  { link: '/gallery', label: 'GALLERY', icon: IconPhoto },
  { divider: true },
  { link: '/careers', label: 'CAREERS', icon: IconBriefcase },
  { divider: true, dividerLabel: 'GLOBAL COMPONENTS' },
  { link: '/logo', label: 'Logo', icon: IconPyramid },
  { link: '/header', label: 'Header', icon: IconLayoutNavbar },
  { link: '/navbar', label: 'Navbar', icon: IconLayoutNavbarFilled },
  { link: '/footer', label: 'Footer', icon: IconLayoutBottombarFilled },
  { divider: true },
  { link: '/photo-library', label: 'Photo Library', icon: IconPhoto },
  { divider: true },
  { link: '/enquiries', label: 'Enquiries', icon: IconMailbox },
  { link: '/applications', label: 'Join Applications', icon: IconUserPlus },
  { link: '/testimonials', label: 'Testimonials', icon: IconQuote },
  { divider: true },
  { link: '/settings', label: 'Settings', icon: IconSettings },
  { link: '/docs', label: 'Documentation', icon: IconFileText }
];