import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.interviewsense.org'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/opportunities`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/internship-opportunities`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/interview`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/technical-assessment`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resume-checker`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/opportunities`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/internship-opportunities`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // Dynamic opportunity pages from generated-content/articles/
  let opportunityPages: MetadataRoute.Sitemap = []
  
  try {
    const articlesDir = path.join(process.cwd(), 'generated-content', 'articles')
    if (fs.existsSync(articlesDir)) {
      const articleFiles = fs.readdirSync(articlesDir)
        .filter(file => file.endsWith('.json'))
      
      opportunityPages = articleFiles.map(file => {
        const slug = file.replace('.json', '')
        return {
          url: `${baseUrl}/opportunities/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.85, // High priority for opportunity pages
        }
      })
    }
  } catch (error) {
    console.error('Error loading opportunities for sitemap:', error)
  }

  return [...staticPages, ...opportunityPages]
}
