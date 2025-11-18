import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Vendedor | Sabor a Campo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardVendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
