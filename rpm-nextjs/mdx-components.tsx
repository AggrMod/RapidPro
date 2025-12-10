import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom heading components with anchor links
    h1: ({ children }) => (
      <h1 className="blog-h1">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="blog-h2">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="blog-h3">{children}</h3>
    ),
    // Custom paragraph
    p: ({ children }) => (
      <p className="blog-paragraph">{children}</p>
    ),
    // Custom link component using Next.js Link
    a: ({ href, children }) => {
      if (href?.startsWith("/")) {
        return <Link href={href}>{children}</Link>;
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    // Custom image component using Next.js Image
    img: ({ src, alt }) => (
      <Image
        src={src || ""}
        alt={alt || ""}
        width={800}
        height={450}
        className="blog-image"
      />
    ),
    // Custom blockquote
    blockquote: ({ children }) => (
      <blockquote className="blog-blockquote">{children}</blockquote>
    ),
    // Custom list components
    ul: ({ children }) => (
      <ul className="blog-list">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="blog-list blog-list-ordered">{children}</ol>
    ),
    // Allow any other components to be passed through
    ...components,
  };
}
