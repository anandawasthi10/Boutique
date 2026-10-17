import { NextResponse } from 'next/server';

const SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="6" fill="#4A3A33" />
  <circle cx="16" cy="16" r="6" fill="#FAF6EF" />
</svg>`;

export async function GET() {
  return new NextResponse(SVG_ICON, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
