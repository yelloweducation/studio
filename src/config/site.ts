
export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage?: string;
  links?: {
    twitter?: string;
    github?: string;
  };
};

export const siteConfig: SiteConfig = {
  name: "Yellow Institute",
  description: "Yellow Institute - Your journey to knowledge starts here. Explore courses in Web Development, Data Science, AI, and more. Interactive learning with flashcards and personality assessments.",
  // IMPORTANT: Replace with your actual production URL.
  // Netlify provides process.env.URL for the main site URL, and process.env.DEPLOY_PRIME_URL for deploy previews.
  // Using NEXT_PUBLIC_SITE_URL which you should set in Netlify environment variables.
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/og-image.png`, // Example, ensure this image exists in /public
  links: {
    // twitter: "https://twitter.com/yourhandle",
  },
};
