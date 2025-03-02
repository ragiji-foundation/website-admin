'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Stack, Text, Tooltip, UnstyledButton, Divider } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { NavLink } from '@mantine/core';
import classes from './Sidebar.module.css';
import { NavItem, navItems } from './navItems'; // We'll create this next

interface NavbarProps {
  onCollapse?: (collapsed: boolean) => void;
}

const getItemKey = (item: NavItem, index: number) => {
  if (item.link) return item.link;
  if (item.divider) return `divider-${item.dividerLabel || index}`;
  return `nav-item-${index}`;
};

export function Navbar({ onCollapse }: NavbarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    onCollapse?.(!collapsed);
  };

  return (
    <nav className={`${classes.navbar} ${collapsed ? classes.collapsed : ''}`}>
      <div className={classes.header}>
        {!collapsed && <Text ta={'center'} fw={900}>Admin Panel</Text>}
        <UnstyledButton
          onClick={toggleCollapse}
          className={classes.toggleButton}
        >
          {collapsed ? <IconChevronRight size={20} /> : <IconChevronLeft size={20} />}
        </UnstyledButton>
      </div>

      <Stack gap="xs" className={classes.navLinks}>
        {navItems.map((item, index) => (
          <NavItemWithChildren
            key={getItemKey(item, index)}
            item={item}
            collapsed={collapsed}
            active={pathname === item.link}
          />
        ))}
      </Stack>
    </nav>
  );
}

function NavItemWithChildren({ item, collapsed, active }: {
  item: typeof navItems[0],
  collapsed: boolean,
  active: boolean
}) {
  const [opened, setOpened] = useState(false);
  const Icon = item.icon;

  if (item.divider) {
    return (
      <Divider
        my="xs"
        label={!collapsed && item.dividerLabel ? item.dividerLabel : null}
        labelPosition="center"
      />
    );
  }

  if (item.links) {
    return (
      <NavLink
        label={
          collapsed ? (
            <Tooltip label={item.label} position="right" withArrow>
              <span className={classes.icon}>
                {Icon && <Icon size={20} />}
              </span>
            </Tooltip>
          ) : (
            <>
              <span className={classes.icon}>
                {Icon && <Icon size={20} />}
              </span>
              <span className={classes.label}>{item.label}</span>
            </>
          )
        }
        className={classes.navButton}
        opened={opened}
        onChange={setOpened}
        childrenOffset={28}
      >
        {item.links.map((child) => (
          <Link
            key={child.link}
            href={child.link || '#'}
            className={classes.navLink}
            passHref
          >
            <NavLink
              component="a"
              label={child.label}
              active={active}
              className={classes.navButton}
            />
          </Link>
        ))}
      </NavLink>
    );
  }

  return (
    <Link
      href={item.link || '/'} // Provide a default value
      passHref
      className={classes.navLink}
    >
      <Tooltip
        label={collapsed ? item.label : ""}
        position="right"
        disabled={!collapsed}
      >
        <NavLink
          component="a"
          label={
            <>
              <span className={classes.icon}>
                {Icon && <Icon size={20} />}
              </span>
              {!collapsed && <span className={classes.label}>{item.label}</span>}
            </>
          }
          active={active}
          className={classes.navButton}
        />
      </Tooltip>
    </Link>
  );
}

export default Navbar;