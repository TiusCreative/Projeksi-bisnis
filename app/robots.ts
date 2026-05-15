import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/'], // Hindari indeksasi untuk halaman privat
    },
    sitemap: 'https://projeksi-bisnis.vercel.app/sitemap.xml',
  };
}
