import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import Badge from '../ui/badge/Badge';
import Image from 'next/image';

// Define the TypeScript interface for the table rows
interface Product {
  id: number; // Unique identifier for each product
  name: string; // Product name
  variants: string; // Number of variants (e.g., "1 Variant", "2 Variants")
  category: string; // Category of the product
  price: string; // Price of the product (as a string with currency symbol)
  // status: string; // Status of the product
  image: string; // URL or path to the product image
  status: 'Delivered' | 'Pending' | 'Canceled'; // Status of the product
}

// Define the table data using the interface
const tableData: Product[] = [
  {
    id: 1,
    name: 'MacBook Pro 13”',
    variants: '2 Variants',
    category: 'Laptop',
    price: '$2399.00',
    status: 'Delivered',
    image: '/images/product/product-01.jpg', // Replace with actual image URL
  },
  {
    id: 2,
    name: 'Apple Watch Ultra',
    variants: '1 Variant',
    category: 'Watch',
    price: '$879.00',
    status: 'Pending',
    image: '/images/product/product-02.jpg', // Replace with actual image URL
  },
  {
    id: 3,
    name: 'iPhone 15 Pro Max',
    variants: '2 Variants',
    category: 'SmartPhone',
    price: '$1869.00',
    status: 'Delivered',
    image: '/images/product/product-03.jpg', // Replace with actual image URL
  },
  {
    id: 4,
    name: 'iPad Pro 3rd Gen',
    variants: '2 Variants',
    category: 'Electronics',
    price: '$1699.00',
    status: 'Canceled',
    image: '/images/product/product-04.jpg', // Replace with actual image URL
  },
  {
    id: 5,
    name: 'AirPods Pro 2nd Gen',
    variants: '1 Variant',
    category: 'Accessories',
    price: '$240.00',
    status: 'Delivered',
    image: '/images/product/product-05.jpg', // Replace with actual image URL
  },
];

export default function RecentOrders() {
  return (
    <div>

    </div>
  );
}
