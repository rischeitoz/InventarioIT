import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiEndpoint(endpointPath: string): string {
  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  if (typeof window !== 'undefined') {
    const envBase = process.env.NEXT_PUBLIC_BASE_PATH;
    if (envBase) {
      return `${envBase.replace(/\/$/, '')}${cleanPath}`;
    }
    // Auto-detect subpath from current URL pathname in IIS (e.g. /Inventario IT/... or /inventario-it/...)
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/(inventario[\s%20\-_]it)/i);
    if (match) {
      return `/${match[1]}${cleanPath}`;
    }
  }
  return cleanPath;
}
