'use client';
import { Layout, Menu } from 'antd';
import Link from 'next/link';

export default function TopNav() {
  return (
    <Layout.Header style={{ display:'flex', alignItems:'center' }}>
      <div style={{ color:'#fff', fontWeight:700, marginRight:24 }}>Inventory</div>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['products']} items={[
        { key:'dashboard', label:<Link href="/dashboard">Dashboard</Link> },
        { key:'products',  label:<Link href="/products">Products</Link> },
        { key:'inventory', label:<Link href="/inventory">Inventory</Link> },
        { key:'suppliers', label:<Link href="/suppliers">Suppliers</Link> },
      ]}/>
    </Layout.Header>
  );
}
