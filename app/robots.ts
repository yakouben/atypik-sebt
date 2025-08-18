import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/host/', '/auth/'],
    },
    sitemap: 'https://www.dsp4-ddm-023dis3-4-g9.fr/sitemap.xml',
  }
} 
