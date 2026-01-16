import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/staff/'],
      },
    ],
    sitemap: 'https://gacp-platform.com/sitemap.xml',
  }
}
