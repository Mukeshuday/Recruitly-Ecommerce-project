import Link from 'next/link';
export default function Home() {
  return (
    <ul style={{ lineHeight: 2 }}>
      <li><Link href="/dashboard">Dashboard</Link></li>
      <li><Link href="/products">Products</Link></li>
      <li><Link href="/inventory">Inventory</Link></li>
      <li><Link href="/suppliers">Suppliers</Link></li>
    </ul>
  );
}
