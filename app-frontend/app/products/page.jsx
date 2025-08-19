'use client';
import ProductGrid from '@/components/Products/ProductGrid';
import { Typography } from 'antd';

export default function ProductsPage() {
  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 12 }}>Products</Typography.Title>
      <ProductGrid />
    </div>
  );
}
