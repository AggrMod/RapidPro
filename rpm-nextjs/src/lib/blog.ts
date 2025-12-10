import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  readingTime: string;
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  readingTime: string;
}

// Get all blog post slugs
export function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs.readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

// Get a single blog post by slug
export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title || "Untitled",
    excerpt: data.excerpt || "",
    date: data.date || new Date().toISOString(),
    author: data.author || "RapidPro Memphis",
    category: data.category || "General",
    tags: data.tags || [],
    image: data.image,
    readingTime: stats.text,
    content,
  };
}

// Get all blog posts metadata (for listing)
export function getAllBlogPosts(): BlogPostMeta[] {
  const slugs = getBlogSlugs();

  const posts = slugs
    .map((slug) => {
      const post = getBlogPost(slug);
      if (!post) return null;

      // Return metadata only (no content)
      const { content, ...meta } = post;
      return meta;
    })
    .filter((post): post is BlogPostMeta => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

// Get posts by category
export function getBlogPostsByCategory(category: string): BlogPostMeta[] {
  return getAllBlogPosts().filter(
    (post) => post.category.toLowerCase() === category.toLowerCase()
  );
}

// Get posts by tag
export function getBlogPostsByTag(tag: string): BlogPostMeta[] {
  return getAllBlogPosts().filter(
    (post) => post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

// Get all categories with post count
export function getAllCategories(): { name: string; count: number }[] {
  const posts = getAllBlogPosts();
  const categoryMap = new Map<string, number>();

  posts.forEach((post) => {
    const count = categoryMap.get(post.category) || 0;
    categoryMap.set(post.category, count + 1);
  });

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Get all tags with post count
export function getAllTags(): { name: string; count: number }[] {
  const posts = getAllBlogPosts();
  const tagMap = new Map<string, number>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      const count = tagMap.get(tag) || 0;
      tagMap.set(tag, count + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Get related posts based on category and tags
export function getRelatedPosts(slug: string, limit = 3): BlogPostMeta[] {
  const currentPost = getBlogPost(slug);
  if (!currentPost) return [];

  const allPosts = getAllBlogPosts().filter((post) => post.slug !== slug);

  // Score posts by relevance
  const scoredPosts = allPosts.map((post) => {
    let score = 0;

    // Same category = 2 points
    if (post.category === currentPost.category) {
      score += 2;
    }

    // Shared tags = 1 point each
    const sharedTags = post.tags.filter((tag) =>
      currentPost.tags.includes(tag)
    );
    score += sharedTags.length;

    return { ...post, score };
  });

  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
