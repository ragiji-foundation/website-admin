'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, NavLink, Stack, Text, Divider, Tooltip, rem } from '@mantine/core';
// Removed TablerIconsProps import as it is not exported by the module
import classes from './Sidebar.module.css';

// Assuming navItems is imported from elsewhere
import { navItems } from './navItems';

// Add proper types for props
interface NavItemLinkProps {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
}

// This component avoids the nested <a> tag issue
const NavItemLink = ({ href, active, children }: NavItemLinkProps) => {
  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        {/* We're using Box as a span to avoid rendering another <a> */}
        <Box component="span" className={classes.navLink}>
          {children}
        </Box>
      </Link>
    );
  }
  return children;
};

// Define NavItem type
interface NavItem {
  link?: string;
  label?: string;
  icon?: React.ComponentType<any>;
  links?: NavItem[];
  divider?: boolean;
  dividerLabel?: string;
}

interface NavItemWithChildrenProps {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}

function NavItemWithChildren({ item, collapsed, active }: NavItemWithChildrenProps) {
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();
  const Icon = item.icon;

  // Handle dividers
  if (item.divider) {
    return (
      <div className={classes.dividerContainer}>
        <Divider
          my="sm"
          color="gray.3"
          labelPosition="center"
          className={classes.divider}
          label={
            !collapsed && item.dividerLabel ? (
              <Text size="xs" fw={500} tt="uppercase" c="dimmed">
                {item.dividerLabel}
              </Text>
            ) : null
          }
        />
      </div>
    );
  }

  // For items with children
  if (item.links) {
    return (
      <NavLink
        label={
          <>
            {Icon && <span className={classes.iconContainer}><Icon size={18} /></span>}
            {!collapsed && <span className={classes.label}>{item.label}</span>}
          </>
        }
        className={classes.navButton}
        classNames={{
          label: classes.navLinkLabel,
          children: classes.navChildren
        }}
        childrenOffset={collapsed ? 8 : 16}
        opened={opened}
        onChange={setOpened}
        // Important: Don't render as an anchor tag
        component="div"
      >
        {item.links.map((child, index) => (
          <NavItemWithChildren
            key={child.link || `${child.label}-${index}`} // Fix: Added index as fallback for unique key
            item={child}
            collapsed={collapsed}
            active={pathname === child.link}
          />
        ))}
      </NavLink>
    );
  }

  // For regular items (leaf nodes)
  const isActive = pathname === item.link;
  const navLink = (
    <NavLink
      label={
        <>
          {Icon && (
            <span className={`${classes.iconContainer} ${isActive ? classes.activeIcon : ''}`}>
              <Icon size={18} />
            </span>
          )}
          {!collapsed && <span className={classes.label}>{item.label}</span>}
        </>
      }
      active={isActive}
      // Important: Render as div, not anchor
      component="div"
      className={`${classes.navButton} ${isActive ? classes.activeNavButton : ''}`}
    />
  );

  return (
    <NavItemLink href={item.link} active={isActive}>
      {collapsed ? (
        <Tooltip
          label={item.label}
          position="right"
          withArrow
          offset={5}
          disabled={!collapsed}
          transitionProps={{ duration: 200 }}
        >
          {navLink}
        </Tooltip>
      ) : navLink}
    </NavItemLink>
  );
}

const Navbar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <nav className={`${classes.navbar} ${collapsed ? classes.collapsed : ''}`}>
      <div className={classes.navbarInner}>
        <div className={classes.navHead}>
          {!collapsed && (
            <Text fw={700} size="lg" c="blue" ta="center" className={classes.logo}>
              Admin Panel
            </Text>
          )}

        </div>

        <Divider mb="md" />

        <div className={classes.navItemsWrapper}>
          <Stack gap="xs" className={classes.navItems}>
            {navItems.map((item, index) => (
              <NavItemWithChildren
                key={item.link || item.dividerLabel || `item-${index}`} // Fix: Added better unique key handling
                item={item}
                collapsed={collapsed}
                active={pathname === item.link}
              />
            ))}
          </Stack>
        </div>
      </div>
    </nav>
  );
};

// Add proper types for ActionIcon props
interface ActionIconProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'light' | 'filled' | 'outline' | 'subtle' | 'default';
  color?: string;
  size?: number | string;
  radius?: number | string | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// Add missing ActionIcon component
const ActionIcon = ({ children, className, onClick, variant, color, size, radius }: ActionIconProps) => {
  return (
    <button
      className={`${classes.actionIcon} ${className || ''} ${variant === 'light' ? classes.actionIconLight : ''}`}
      onClick={onClick}
      style={{ borderRadius: radius === 'xl' ? '50%' : rem(4) }}
    >
      {children}
    </button>
  );
};

export default Navbar;