import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Healthcare Compliance Training Platform",
  description:
    "Production-ready compliance training platform for module completion, quiz assessment, and verified certificate generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (function () {
      try {
        var key = 'medscape-theme';
        var stored = localStorage.getItem(key);
        var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolved);
        document.documentElement.dataset.theme = resolved;
      } catch (error) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
