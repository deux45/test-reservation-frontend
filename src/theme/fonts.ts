import { Roboto, Roboto_Mono } from 'next/font/google';

/**
 * Self-hosted by next/font at build time.
 *
 * No request to fonts.googleapis.com at runtime, so there is no third-party
 * connection on the critical path and no layout shift while a webfont
 * arrives.
 */
export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const robotoMono = Roboto_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});
