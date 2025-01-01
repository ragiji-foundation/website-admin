'use client';

import React from 'react';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import {
  Autocomplete,
  Burger,
  Group,
  Menu,
  Center,
  Drawer,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './HeaderMenu.module.css';

const links = [
  { link: '/', label: 'HOME' },
  {
    link: '#1',
    label: 'ABOUT US',
    links: [
      { link: '/pages/the-need', label: 'THE NEED' },
      { link: '/pages/our-story', label: 'OUR STORY' },
      { link: '/pages/our-centers', label: 'OUR CENTERS' },
      { link: '/pages/our-initiatives', label: 'OUR INITIATIVES' },
      { link: '/pages/success-stories', label: 'SUCCESS STORIES' },
    ],
  },
  {
    link: '#2',
    label: 'MEDIA',
    links: [
      { link: '/pages/news-coverage', label: 'NEWS COVERAGE' },
      { link: '/pages/electronic-media', label: 'ELECTRONIC MEDIA' },
      { link: '/pages/gallery', label: 'GALLERY' },
      { link: '/pages/blog', label: 'BLOGS' },
    ],
  },
  { link: '/pages/awards', label: 'AWARDS' },
  { link: '/pages/career', label: 'CAREERS' },
  { link: '/pages/contact-us', label: 'CONTACT US' },
];

const searchData = [
  'The Need',
  'Our Story',
  'Our Centers',
  'Our Initiatives',
  'Success Stories',
  'News Coverage',
  'Electronic Media',
  'Gallery',
  'Blogs',
  'Awards',
  'Careers',
  'Contact Us',
];

export function HeaderMenu() {
  const [opened, { toggle }] = useDisclosure(false);
  const [drawerOpened, { open, close }] = useDisclosure(false);

  const navItems = links.map((link, index) => {
    if (link.links) {
      const menuItems = link.links.map((item, subIndex) => (
        <Menu.Item key={subIndex}>
          <a href={item.link} className={classes.dropdownLink}>
            {item.label}
          </a>
        </Menu.Item>
      ));

      return (
        <Menu key={index} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
          <Menu.Target>
            <span className={classes.link}>
              <Center>
                <Text>{link.label}</Text>
                <IconChevronDown size={14} stroke={1.5} />
              </Center>
            </span>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <a key={index} href={link.link} className={classes.link}>
        {link.label}
      </a>
    );
  });

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
          <Burger opened={opened} onClick={() => { toggle(); open(); }} size="sm" hiddenFrom="sm" />
          <MantineLogo size={28} />
        </Group>
        <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
          {navItems}
        </Group>
        <Autocomplete
          className={classes.search}
          placeholder="Search"
          leftSection={<IconSearch size={16} stroke={1.5} />}
          data={searchData}
          visibleFrom="xs"
        />
      </div>

      <Drawer
        opened={drawerOpened}
        onClose={close}
        position="left"
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
      >
        <Autocomplete
          className={classes.search}
          placeholder="Search"
          leftSection={<IconSearch size={16} stroke={1.5} />}
          data={searchData}
        />

        <div className="drawer-stack">
          <Stack gap="xs">
            {links.map((link, index) => (
              <React.Fragment key={index}>
                {link.links ? (
                  <>
                    <Text size="lg">{link.label}</Text>
                    <Stack gap={5}>
                      {link.links.map((sublink, subIndex) => (
                        <a
                          key={subIndex}
                          href={sublink.link}
                          className={classes.link}
                          onClick={(event) => {
                            event.preventDefault();
                            close();
                            window.location.href = sublink.link;
                          }}
                        >
                          {sublink.label}
                        </a>
                      ))}
                    </Stack>
                  </>
                ) : (
                  <a
                    key={index}
                    href={link.link}
                    className={classes.link}
                    onClick={(event) => {
                      event.preventDefault();
                      close();
                      if (link.link !== '#') {
                        window.location.href = link.link;
                      }
                    }}
                  >
                    {link.label}
                  </a>
                )}
              </React.Fragment>
            ))}
          </Stack>
        </div>
      </Drawer>
    </header>
  );
}

export default HeaderMenu; 