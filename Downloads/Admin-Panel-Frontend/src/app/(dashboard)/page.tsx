import React from 'react';
import { Metadata } from 'next';
import EcommerceMetrics from '@/components/ecommerce/EcommerceMetrics';
import MonthlySalesChart from '@/components/ecommerce/MonthlySalesChart';
import DemographicCard from '@/components/ecommerce/DemographicCard';
import RecentOrders from '@/components/ecommerce/RecentOrders';

export const metadata: Metadata = {
  title: 'Dashboard | Core Media Admin',
  description: 'Core Media Admin Dashboard',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="w-full">
        <EcommerceMetrics />
      </div>

      <div className="w-full">
        <MonthlySalesChart />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
        <div className="xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
