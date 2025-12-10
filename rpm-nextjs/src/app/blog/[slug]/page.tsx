import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogSlugs, getRelatedPosts } from "@/lib/blog";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for each post
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found | RapidPro Memphis",
    };
  }

  return {
    title: `${post.title} | RapidPro Memphis Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, 3);

  // Article schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "LocalBusiness",
      name: "RapidPro Memphis",
      telephone: "+1-901-257-9417",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Memphis",
        addressRegion: "TN",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://rapidpromemphis.com/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Header */}
      <header className={styles.header}>
        <div className="container">
          <Link href="/blog" className={styles.backLink}>
            Back to Blog
          </Link>
          <div className={styles.meta}>
            <span className={styles.category}>{post.category}</span>
            <span className={styles.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className={styles.readTime}>{post.readingTime}</span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.excerpt}>{post.excerpt}</p>
          {post.tags.length > 0 && (
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Article Content */}
      <article className={styles.article}>
        <div className="container">
          <div className={styles.content}>
            {/* Render MDX content as markdown-formatted HTML */}
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{
                __html: convertMarkdownToHTML(post.content),
              }}
            />
          </div>
        </div>
      </article>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2>Need Equipment Repair?</h2>
              <p>
                Our expert technicians are available for same-day service in
                Memphis and surrounding areas. Don't let equipment problems slow
                down your kitchen.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <a href="tel:+19012579417" className={styles.ctaPhone}>
                <span>Call Now</span>
                <strong>(901) 257-9417</strong>
              </a>
              <Link href="/quote" className={styles.ctaButton}>
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className={styles.related}>
          <div className="container">
            <h2 className={styles.relatedTitle}>Related Articles</h2>
            <div className={styles.relatedGrid}>
              {relatedPosts.map((relPost) => (
                <Link
                  key={relPost.slug}
                  href={`/blog/${relPost.slug}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImage}>
                    <span>{relPost.category}</span>
                  </div>
                  <div className={styles.relatedContent}>
                    <h3>{relPost.title}</h3>
                    <span className={styles.relatedMeta}>
                      {relPost.readingTime}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

// Simple markdown to HTML converter for the blog content
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    // Paragraphs (lines with content that aren't already tagged)
    .split('\n\n')
    .map(block => {
      if (block.startsWith('<')) return block;
      if (block.trim() === '') return '';
      // Wrap consecutive <li> items in <ul>
      if (block.includes('<li>')) {
        return `<ul>${block}</ul>`;
      }
      return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return html;
}
