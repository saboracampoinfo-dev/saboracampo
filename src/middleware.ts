/**
 * Next.js Middleware - runs in Edge Runtime
 * 
 * IMPORTANT: This middleware runs in Edge Runtime, which doesn't support Node.js modules.
 * We use quickValidateToken from jwt-edge.ts which uses Web Crypto API instead of Node's crypto.
 * 
 * For full JWT signature verification in API routes, use verifyToken from jwt.ts instead.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { quickValidateToken } from '@/lib/jwt-edge';

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/productos',
  '/api/auth/login',
  '/api/auth/register',
  '/api/products',
];

// Rutas protegidas por rol
const roleRoutes = {
  user: ['/dashboardCliente'],
  seller: ['/dashboardVendedor', '/dashboardCliente'],
  cashier: ['/dashboardCajero', '/dashboardCliente'],
  admin: ['/dashboardAdmin', '/dashboardVendedor', '/dashboardCajero', '/dashboardCliente'],
};

// Función para verificar si una ruta es pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === pathname) return true;
    // Permitir rutas que empiecen con rutas públicas (ej: /productos/123)
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

// Función para obtener la ruta del dashboard según el rol
function getDashboardByRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/dashboardAdmin';
    case 'seller':
      return '/dashboardVendedor';
    case 'cashier':
      return '/dashboardCajero';
    case 'user':
    default:
      return '/dashboardCliente';
  }
}

// Función para verificar si el usuario tiene acceso a la ruta
function hasAccessToRoute(role: string, pathname: string): boolean {
  const allowedRoutes = roleRoutes[role as keyof typeof roleRoutes] || roleRoutes.user;
  
  return allowedRoutes.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir archivos estáticos y recursos públicos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/iconos') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Permitir TODAS las rutas API - cada API route maneja su propia autenticación
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Obtener token de las cookies
  const token = request.cookies.get('auth-token')?.value;

  // Si no hay token, redirigir a login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Verificar token (quick validation for Edge Runtime)
  const decoded = quickValidateToken(token);
  
  if (!decoded) {
    // Token inválido, redirigir a login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    
    const response = NextResponse.redirect(url);
    response.cookies.delete('auth-token');
    return response;
  }

  // Verificar acceso según rol
  const { role } = decoded;

  // Si el usuario intenta acceder a un dashboard
  if (pathname.startsWith('/dashboard')) {
    // Verificar si tiene acceso a esa ruta específica
    if (!hasAccessToRoute(role, pathname)) {
      // Redirigir al dashboard correspondiente a su rol
      const url = request.nextUrl.clone();
      url.pathname = getDashboardByRole(role);
      return NextResponse.redirect(url);
    }
  }

  // Si el usuario está autenticado y intenta acceder a login/register
  if (pathname === '/login' || pathname === '/register') {
    const url = request.nextUrl.clone();
    url.pathname = getDashboardByRole(role);
    return NextResponse.redirect(url);
  }

  // Permitir acceso
  const response = NextResponse.next();
  
  // Agregar headers con información del usuario (opcional)
  response.headers.set('x-user-id', decoded.userId);
  response.headers.set('x-user-role', decoded.role);
  
  return response;
}

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
