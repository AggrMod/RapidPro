import { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts, getAllCategories, getAllTags } from "@/lib/blog";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog | Commercial Kitchen Equipment Tips & Resources",
  description:
    "Expert tips and guides on commercial kitchen equipment maintenance, troubleshooting, and repair. Stay informed with RapidPro Memphis.",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  // Blog listing schema
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "RapidPro Memphis Blog",
    description: "Commercial kitchen equipment tips, maintenance guides, and industry insights",
    url: "https://rapidpromemphis.com/blog",
    publisher: {
      "@type": "LocalBusiness",
      name: "RapidPro Memphis",
      telephone: "+1-901-257-9417",
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: {
        "@type": "Organization",
        name: post.author,
      },
      url: `https://rapidpromemphis.com/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Resource Center</h1>
          <p className={styles.subtitle}>
            Expert tips, maintenance guides, and troubleshooting advice for
            commercial kitchen equipment
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.main}>
        <div className="container">
          <div className={styles.layout}>
            {/* Blog Posts */}
            <div className={styles.posts}>
              {posts.length === 0 ? (
                <div className={styles.noPosts}>
                  <h2>Coming Soon</h2>
                  <p>
                    We're working on helpful content for restaurant owners.
                    Check back soon!
                  </p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {posts.map((post) => (
                    <article key={post.slug} className={styles.card}>
                      <div className={styles.cardImage}>
                        <div className={styles.placeholder}>
                          <span>{post.category}</span>
                        </div>
                      </div>
                      <div className={styles.cardContent}>
                        <div className={styles.meta}>
                          <span className={styles.category}>{post.category}</span>
                          <span className={styles.date}>
                            {new Date(post.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <h2 className={styles.cardTitle}>
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h2>
                        <p className={styles.excerpt}>{post.excerpt}</p>
                        <div className={styles.cardFooter}>
                          <span className={styles.readTime}>{post.readingTime}</span>
                          <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                            Read More
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              {/* Categories */}
              {categories.length > 0 && (
                <div className={styles.widget}>
                  <h3 className={styles.widgetTitle}>Categories</h3>
                  <ul className={styles.categoryList}>
                    {categories.map((cat) => (
                      <li key={cat.name}>
                        <span className={styles.categoryName}>{cat.name}</span>
                        <span className={styles.categoryCount}>{cat.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className={styles.widget}>
                  <h3 className={styles.widgetTitle}>Popular Topics</h3>
                  <div className={styles.tagCloud}>
                    {tags.slice(0, 10).map((tag) => (
                      <span key={tag.name} className={styles.tag}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className={styles.ctaWidget}>
                <h3>Need Help Now?</h3>
                <p>
                  Don't wait for equipment problems to get worse. Contact us for
                  fast, reliable repair service.
                </p>
                <a href="tel:+19012579417" className={styles.ctaPhone}>
                  (901) 257-9417
                </a>
                <Link href="/quote" className={styles.ctaButton}>
                  Request Quote
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
