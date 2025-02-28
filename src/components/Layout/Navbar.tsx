import Link from 'next/link';
import {
  IconLayoutBottombarFilled,
  IconLayoutNavbar,
  IconLayoutNavbarFilled,
  IconCrop,
  IconPyramid,
  IconMailbox,
  IconQuote,
  IconTags,
  IconDashboard,
  IconFileText,
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
} from '@tabler/icons-react';
import { Stack, Divider, Text } from '@mantine/core';
import { NavLink } from '@mantine/core';
import classes from './Navbar.module.css';

// Define the PageLink type
export type PageLink = {
  link: string;
  label: string;
  icon?: React.ComponentType<any>;
  links?: PageLink[];
};

const pagesLinks: PageLink[] = [
  { link: '/home', label: 'HOME', icon: IconHome },
  {
    link: '#1',
    label: 'ABOUT US',
    icon: IconBuildingCommunity,
    links: [
      { link: '/the-need', label: 'THE NEED' },
      { link: '/our-story', label: 'OUR STORY' },
      { link: '/our-centers', label: 'OUR CENTERS' },
      { link: '/our-initiatives', label: 'OUR INITIATIVES' },
      { link: '/success-stories', label: 'SUCCESS STORIES' },
    ],
  },
  { link: '/awards', label: 'AWARDS', icon: IconAward },
  {
    link: '#2',
    label: 'MEDIA',
    icon: IconNews,
    links: [
      { link: '/news-coverage', label: 'NEWS COVERAGE' },
      { link: '/blog', label: 'BLOGS' },
      { link: '/electronic-media', label: 'ELECTRONIC MEDIA' },
      { link: '/gallery', label: 'GALLERY' },
    ],
  },
  { link: '/careers', label: 'CAREERS', icon: IconBriefcase },
  { link: '/contact-us', label: 'CONTACT US', icon: IconMessage }
];

export function Navbar() {
  return (
    <div className={classes.navbar}>
      {/* <div className={classes.header}>
        <Text fw={700} size="lg">
          Admin Panel
        </Text>
      </div>
      <Divider my="sm" /> */}
      <Stack gap="md" className={classes.navLinks} p="md">
        {/* Dashboard */}
        <Link href="/" passHref legacyBehavior>
          <NavLink
            component="a"
            label="Dashboard"
            leftSection={<IconDashboard size={16} />}
            className={classes.navButton}
          />
        </Link>

        {/* Blogs with Nested Navigation */}
        <NavLink
          label="Blogs"
          leftSection={<IconFileText size={16} />}
          childrenOffset={28}
          className={classes.navButton}
        >
          <Link href="/blogs/create" passHref legacyBehavior>
            <NavLink
              component="a"
              label="Create Blog"
              leftSection={<IconPlus size={16} />}
            />
          </Link>
          <Link href="/blogs/drafts" passHref legacyBehavior>
            <NavLink
              component="a"
              label="Drafts"
              leftSection={<IconEdit size={16} />}
            />
          </Link>
          <Link href="/blogs" passHref legacyBehavior>
            <NavLink
              component="a"
              label="All Blogs"
              leftSection={<IconList size={16} />}
            />
          </Link>

          {/* Taxonomy section within Blogs */}
          <NavLink
            label="Taxonomy"
            leftSection={<IconTags size={16} />}
            childrenOffset={28}
          >
            <Link href="/blogs/taxonomy?type=categories" passHref legacyBehavior>
              <NavLink
                component="a"
                label="Categories"
                leftSection={<IconList size={16} />}
              />
            </Link>
            <Link href="/blogs/taxonomy?type=tags" passHref legacyBehavior>
              <NavLink
                component="a"
                label="Tags"
                leftSection={<IconList size={16} />}
              />
            </Link>
          </NavLink>
        </NavLink>

        {/* Banner */}
        <Link href="/banner" passHref legacyBehavior>
          <NavLink
            component="a"
            label="Banner"
            leftSection={<IconCrop size={16} />}
            className={classes.navButton}
          />
        </Link>

        {/* Pages with Nested Navigation */}
        <NavLink
          label="Pages"
          leftSection={<IconFileText size={16} />}
          childrenOffset={28}
          className={classes.navButton}
        >
          {pagesLinks.map((item) => (
            <NavLinkWithChildren key={item.link} item={item} />
          ))}
        </NavLink>

        {/* Global Components */}
        <NavLink
          label="Global Components"
          leftSection={<IconLayoutNavbar size={16} />}
          childrenOffset={28}
          className={classes.navButton}
        >
          <Link href='/logo' passHref legacyBehavior>
            <NavLink
              component="a"
              label="Logo"
              leftSection={<IconPyramid size={16} />}
            />
          </Link>
          <Link href='/header' passHref legacyBehavior>
            <NavLink
              component="a"
              label="Header"
              leftSection={<IconLayoutNavbar size={16} />}
            />
          </Link>
          <Link href='/navbar' passHref legacyBehavior>
            <NavLink
              component="a"
              label="Navbar"
              leftSection={<IconLayoutNavbarFilled size={16} />}
            />
          </Link>
          <Link href='/footer' passHref legacyBehavior>
            <NavLink
              component="a"
              label="Footer"
              leftSection={<IconLayoutBottombarFilled size={16} />}
            />
          </Link>
        </NavLink>

        {/* Enquiries */}
        <Link href="/enquiries" passHref legacyBehavior>
          <NavLink
            component="a"
            label="Enquiries"
            leftSection={<IconMailbox size={16} />}
            className={classes.navButton}
          />
        </Link>

        {/* Testimonials */}
        <Link href="/testimonials" passHref legacyBehavior>
          <NavLink
            component="a"
            label="Testimonials"
            leftSection={<IconQuote size={16} />}
            className={classes.navButton}
          />
        </Link>

        {/* Photo Library */}
        <Link href="/photo-library" passHref legacyBehavior>
          <NavLink
            component="a"
            label="Photo Library"
            leftSection={<IconPhoto size={16} />}
            className={classes.navButton}
          />
        </Link>

        {/* Add this before the Settings NavLink */}
        <Link href="/applications" passHref legacyBehavior>
          <NavLink
            component="a"
            label="Join Applications"
            leftSection={<IconUserPlus size={16} />}
            className={classes.navButton}
          />
        </Link>

        {/* Settings */}
        <Link href="/settings" passHref legacyBehavior>
          <NavLink
            component="a"
            label="Settings"
            leftSection={<IconSettings size={16} />}
            className={classes.navButton}
          />
        </Link>

        {/* Docs */}
        <Link href="/docs" passHref legacyBehavior>
          <NavLink
            component="a"
            label="Documentation"
            leftSection={<IconFileText size={16} />}
            className={classes.navButton}
          />
        </Link>
      </Stack>
    </div>
  );
}

function NavLinkWithChildren({ item }: { item: PageLink }) {
  const { link, label, icon: Icon, links } = item;

  if (links) {
    return (
      <NavLink
        label={label}
        leftSection={Icon ? <Icon size={16} stroke={1.5} /> : null}
        childrenOffset={28}
      >
        {links.map((child: PageLink) => (
          <Link href={child.link} key={child.link} passHref legacyBehavior>
            <NavLink component="a" label={child.label} />
          </Link>
        ))}
      </NavLink>
    );
  }

  return (
    <Link href={link} passHref legacyBehavior>
      <NavLink
        component="a"
        label={label}
        leftSection={Icon ? <Icon size={16} stroke={1.5} /> : null}
      />
    </Link>
  );
}

export default Navbar;