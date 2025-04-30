import { Layout } from '@/components/dom/Layout';
import { PromotionProvider } from '@/helpers/PromotionContext';
import { LichessProvider } from '@/helpers/LichessContext';
import './globals.css';

export const metadata = {
  title: 'Next.js + Three.js',
  description: 'A minimal starter for Nextjs + React-three-fiber and Threejs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head />
      <body>
        <PromotionProvider>
          <LichessProvider>
            <Layout>{children}</Layout>
          </LichessProvider>
        </PromotionProvider>
      </body>
    </html>
  );
}
