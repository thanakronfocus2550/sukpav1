import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'SUK PA? (ซักป่ะ?) — บริการรับ-ส่งผ้า มจพ. ปราจีนบุรี',
  description: 'บริการจองรับ-ส่งผ้าถึงหอพัก สะดวก รวดเร็ว สะอาด สำหรับนักศึกษา มจพ. ปราจีนบุรี',
  icons: {
    icon: [
      { url: '/images/mascot.jpg', type: 'image/jpeg' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/images/mascot.jpg' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
