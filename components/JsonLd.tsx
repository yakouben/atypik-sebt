interface BreadcrumbJsonLdProps {
  items: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  pageUrl: string;
}

export default function BreadcrumbJsonLd({ items, pageUrl }: BreadcrumbJsonLdProps) {
  // Filter out items without href (current page)
  const breadcrumbItems = items.filter(item => item.href);
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface PageJsonLdProps {
  title: string;
  description: string;
  pageUrl: string;
  pageType?: 'WebPage' | 'Article' | 'Product' | 'Organization';
  imageUrl?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export function PageJsonLd({ 
  title, 
  description, 
  pageUrl, 
  pageType = 'WebPage',
  imageUrl,
  publishedDate,
  modifiedDate
}: PageJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": pageType,
    "name": title,
    "description": description,
    "url": pageUrl,
    ...(imageUrl && { "image": imageUrl }),
    ...(publishedDate && { "datePublished": publishedDate }),
    ...(modifiedDate && { "dateModified": modifiedDate })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface OrganizationJsonLdProps {
  name: string;
  description: string;
  url: string;
  logo: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    contactType: string;
    email: string;
  };
}

export function OrganizationJsonLd({ 
  name, 
  description, 
  url, 
  logo,
  address,
  contactPoint
}: OrganizationJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "description": description,
    "url": url,
    "logo": logo,
    ...(address && {
      "address": {
        "@type": "PostalAddress",
        ...address
      }
    }),
    ...(contactPoint && {
      "contactPoint": {
        "@type": "ContactPoint",
        ...contactPoint
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
