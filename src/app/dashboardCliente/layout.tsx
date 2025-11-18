import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Cliente | Sabor a Campo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
