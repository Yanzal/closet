import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML document for every statically-rendered web page (web only).
 * Adds the PWA manifest + Apple "Add to Home Screen" meta so the GitHub Pages
 * build installs as a standalone app on iPhone. Asset paths include the
 * `/closet` base path (must match `experiments.baseUrl` in app.json).
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        <link rel="manifest" href="/closet/manifest.json" />
        <meta name="theme-color" content="#208AEF" />

        {/* iPhone "Add to Home Screen" → fullscreen standalone app */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Closet" />
        <link rel="apple-touch-icon" href="/closet/apple-touch-icon.png" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
