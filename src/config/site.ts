
export type SiteConfig = {
  name: string;
  description: string;
  url: string; // Your production domain
  ogImage?: string; // Optional default Open Graph image
  links?: {
    twitter?: string;
    github?: string;
    // Add other social links if needed
  };
};

export const siteConfig: SiteConfig = {
  name: "Yellow Institute",
  description: "Yellow Institute - Your journey to knowledge starts here. Explore courses in Web Development, Data Science, AI, and more. Interactive learning with flashcards and personality assessments.",
  url: "https://your-production-url.com", // IMPORTANT: Replace with your actual domain
  // ogImage: "https://your-production-url.com/og.png", // IMPORTANT: Replace with your OG image URL
  // links: {
  //   twitter: "https://twitter.com/yourhandle",
  // },
};
