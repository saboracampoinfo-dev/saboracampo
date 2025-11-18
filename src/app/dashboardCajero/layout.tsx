import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Cajero | Sabor a Campo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardCajeroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
