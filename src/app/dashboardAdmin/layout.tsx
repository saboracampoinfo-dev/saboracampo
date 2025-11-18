import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Admin | Sabor a Campo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
