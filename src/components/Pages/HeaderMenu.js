// 'use client';
// import React from 'react';
// import { IconChevronDown, IconSearch } from '@tabler/icons-react';
// import {
//   Autocomplete,
//   Burger,
//   Group,
//   Menu,
//   Center,
//   Drawer,
//   Stack,
//   Text,
// } from '@mantine/core';
// import { useDisclosure } from '@mantine/hooks';
// import { MantineLogo } from '@mantinex/mantine-logo';
// import classes from './HeaderMenu.module.css';

// const links = [
//   { link: '/', label: 'HOME' },
//   {
//     link: '#1',
//     label: 'ABOUT US',
//     links: [
//       { link: '/the-need', label: 'THE NEED' },
//       { link: '/our-story', label: 'OUR STORY' },
//       { link: '/our-initiatives', label: 'OUR INITIATIVES' },
//       { link: '/success-stories', label: 'SUCCESS STORIES' },
//     ],
//   },
//   { link: '/awards', label: 'AWARDS' },
//   {
//     link: '#2',
//     label: 'MEDIA',
//     links: [
//       { link: '/news-coverage', label: 'NEWS COVERAGE' },
//       { link: '/blog', label: 'BLOGS' },
//       { link: '/electronic-media', label: 'ELECTRONIC MEDIA' },
//     ],
//   }
// ];


// export function HeaderMenu() {
//   const [opened, { toggle }] = useDisclosure(false);
//   const [drawerOpened, { open, close }] = useDisclosure(false);

//   const navItems = links.map((link, index) => {
//     if (link.links) {
//       const menuItems = link.links.map((item, subIndex) => (
//         <Menu.Item key={subIndex}>
//           <a href={item.link} className={classes.dropdownLink}>
//             {item.label}
//           </a>
//         </Menu.Item>
//       ));
  
//       return (
//         <Menu key={index} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
//           {/* Correct usage:  Menu handles the target */}
//           <Menu.Target>
//             <span className={classes.link}>
//               <Center>
//                 <Text>{link.label}</Text>
//                 <IconChevronDown size={14} stroke={1.5} />
//               </Center>
//             </span>
//           </Menu.Target>
//           <Menu.Dropdown>{menuItems}</Menu.Dropdown>
//         </Menu>
//       );
//     }
  
//     return (
//       <a key={index} href={link.link} className={classes.link}>
//         {link.label}
//       </a>
//     );
//   });
  
  

//   return (
//     <header className={classes.header}>
//       <div className={classes.inner}>
//         <Group>
//           <Burger opened={opened} onClick={() => { toggle(); open(); }} size="sm" hiddenFrom="sm" />
//           <MantineLogo size={28} />
//         </Group>
//         <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
//           {navItems}
//         </Group>
//         <Autocomplete
//           className={classes.search}
//           placeholder="Search"
//           leftSection={<IconSearch size={16} stroke={1.5} />}
//           data={[
//             'The Need',
//             'Our Story',
//             'Our Initiatives',
//             'Success Stories',
//             'News Coverage',
//             'Blogs',
//             'Electronic Media',
//             'Awards',
//           ]}
//           visibleFrom="xs"
//         />
//       </div>

//       <Drawer
//         opened={drawerOpened}
//         onClose={close}
//         position="left"
//         size="100%"
//         padding="md"
//         title="Navigation"
//       >
//         <Autocomplete
//           className={classes.search}
//           placeholder="Search"
//           leftSection={<IconSearch size={16} stroke={1.5} />}
//           data={[
//             'The Need',
//             'Our Story',
//             'Our Initiatives',
//             'Success Stories',
//             'News Coverage',
//             'Blogs',
//             'Electronic Media',
//             'Awards',
//           ]}
//         />
     
//      <div className="drawer-stack">
//           <Stack gap="xs">
//             {links.map((link, index) => (
//               <React.Fragment key={index}>
//                 {link.links ? (
//                   <>
//                     <Text size="lg">{link.label}</Text>
//                     <Stack gap={5}>
//                       {link.links.map((sublink, subIndex) => (
//                         <a
//                           key={subIndex}
//                           href={sublink.link}
//                           className={classes.link}
//                           onClick={(event) => {
//                             event.preventDefault();
//                             close();
//                           }}
//                         >
//                           {sublink.label}
//                         </a>
//                       ))}
//                     </Stack>
//                   </>
//                 ) : (
//                   <a
//                     key={index}
//                     href={link.link}
//                     className={classes.link}
//                     onClick={(event) => {
//                       event.preventDefault();
//                       if (link.link !== '#') {
//                         close();
//                       }
//                     }}
//                   >
//                     {link.label}
//                   </a>
//                 )}
//               </React.Fragment>
//             ))}
//           </Stack>
//         </div>
//       </Drawer>
//     </header>
//   );
// }

// components/HeaderMenu.js
"use client"
import React, { useState, useEffect } from 'react';
import { MantineLogo } from '@mantinex/mantine-logo';
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
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import classes from './HeaderMenu.module.css';

const HeaderMenu = () => {
  const [links, setLinks] = useState([]);
  const [opened, { toggle }] = useDisclosure(false);
  const [drawerOpened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    // Replace this with your internal API call
    const fetchLinks = async () => {
      try {
        const response = await fetch('/api/links', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        setLinks(data.links); // Access the 'links' property
      } catch (error) {
        console.error('Error fetching links:', error);
        // You can also display an error message to the user here
      }
    };
    fetchLinks();
  }, []);

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
          data={[
            'The Need',
            'Our Story',
            'Our Initiatives',
            'Success Stories',
            'News Coverage',
            'Blogs',
            'Electronic Media',
            'Awards',
          ]}
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
      >
        <Autocomplete
          className={classes.search}
          placeholder="Search"
          leftSection={<IconSearch size={16} stroke={1.5} />}
          data={[
            'The Need',
            'Our Story',
            'Our Initiatives',
            'Success Stories',
            'News Coverage',
            'Blogs',
            'Electronic Media',
            'Awards',
          ]}
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
                      if (link.link !== '#') {
                        close();
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
};

export default HeaderMenu;