'use client';

import Box from '@mui/material/Box';
import Link from 'next/link';
import { es } from '@/i18n/es';
import { monoFontFamily } from '@/theme/theme';

export interface Section {
  href: string;
  label: string;
  /** Shown in the app bar. This is a technical exercise; the API is the point. */
  endpoint: string;
  icon: string;
}

export const SECTIONS: Section[] = [
  {
    href: '/resources',
    label: es.nav.resources,
    endpoint: 'GET /api/v1/resources',
    icon: '▣',
  },
  {
    href: '/reservations',
    label: es.nav.reservations,
    endpoint: 'GET /api/v1/reservations',
    icon: '◷',
  },
];

/**
 * Real links, not click handlers.
 *
 * The mockup used onClick because it was a single-file prototype. Anchors give
 * back middle-click, open-in-new-tab, keyboard focus order and a URL worth
 * sharing -- none of which a div can be talked into.
 */
export function NavList({ current }: { current: string }) {
  return (
    <Box
      component="nav"
      aria-label={es.app.name}
      sx={{ py: 1, display: 'flex', flexDirection: 'column' }}
    >
      {SECTIONS.map((section) => {
        const active = section.href === current;

        return (
          <Box
            key={section.href}
            component={Link}
            href={section.href}
            aria-current={active ? 'page' : undefined}
            sx={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: active ? 500 : 400,
              color: active ? 'primary.main' : 'text.primary',
              bgcolor: active ? 'action.selected' : 'transparent',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box
              aria-hidden
              component="span"
              sx={{
                width: 20,
                textAlign: 'center',
                fontFamily: monoFontFamily,
                fontSize: 13,
                opacity: 0.9,
              }}
            >
              {section.icon}
            </Box>
            <span>{section.label}</span>
          </Box>
        );
      })}
    </Box>
  );
}
