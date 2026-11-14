import './globals.css';

export const metadata = {
  title: 'Bangladesh Public Database Explorer (Next.js)',
  description:
    'Interactive Explorer for Bangladesh Biggest Public Database — 22 Categories, 494 Upazilas, 93.9K+ Land Khatians & 2.33 TB Google Drive Mouza Maps',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 font-['Inter','Noto_Sans_Bengali',sans-serif] antialiased">
        {children}
      </body>
    </html>
  );
}
