import './globals.css';
import { ConfigProvider, App as AntApp } from 'antd';
import TopNav from '@/components/common/TopNav';

export const metadata = { title: 'E‑Commerce Inventory', description: 'Product Inventory Management' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider theme={{ token: { borderRadius: 6 } }}>
          <AntApp>
            <TopNav />
            <main style={{ padding: 16 }}>{children}</main>
          </AntApp>
        </ConfigProvider>
      </body>
    </html>
  );
}
