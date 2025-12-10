"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/testimonials", label: "Testimonials" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.container}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="Rapid Pro Maintenance"
            width={180}
            height={60}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.navLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA Buttons */}
        <div className={styles.cta}>
          <Link href="mailto:R22subcooling@gmail.com" className={styles.ctaEmail}>
            Get Quote
          </Link>
          <Link href="tel:+19012579417" className={styles.ctaPhone}>
            <span className={styles.phoneIcon}>📞</span>
            (901) 257-9417
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.menuBtn} ${isMenuOpen ? styles.active : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <nav className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ""}`}>
        <ul className={styles.mobileNavList}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className={styles.mobileCtaItem}>
            <Link
              href="tel:+19012579417"
              className={styles.mobileCtaPhone}
              onClick={() => setIsMenuOpen(false)}
            >
              📞 Call (901) 257-9417
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
