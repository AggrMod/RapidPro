import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCallBar from "@/components/StickyCallBar";
import AnnouncementBannerWrapper from "@/components/AnnouncementBannerWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rapidpromemphis.com"),
  title: {
    default: "Memphis Commercial Kitchen Repair | Rapid Pro Maintenance",
    template: "%s | Rapid Pro Maintenance",
  },
  description:
    "Memphis' premier commercial kitchen equipment repair. Same-day service for ovens, fryers, dishwashers, ice machines & walk-in coolers. Call (901) 257-9417",
  keywords: [
    "commercial kitchen repair memphis",
    "restaurant equipment repair",
    "commercial oven repair",
    "commercial fryer repair",
    "ice machine repair memphis",
    "walk-in cooler repair",
  ],
  authors: [{ name: "Rapid Pro Maintenance" }],
  creator: "Rapid Pro Maintenance",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rapidpromemphis.com",
    siteName: "Rapid Pro Maintenance",
    title: "Memphis Commercial Kitchen Repair | Rapid Pro Maintenance",
    description:
      "Memphis' premier commercial kitchen equipment repair. Same-day service available.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rapid Pro Maintenance - Memphis Commercial Kitchen Repair",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Memphis Commercial Kitchen Repair | Rapid Pro Maintenance",
    description:
      "Memphis' premier commercial kitchen equipment repair. Same-day service available.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://rapidpromemphis.com/#business",
              name: "Rapid Pro Maintenance",
              alternateName: "RPM Memphis",
              description:
                "Memphis commercial kitchen appliance maintenance and repair services for restaurants, hotels, schools, and food service businesses.",
              url: "https://rapidpromemphis.com",
              telephone: "+1-901-257-9417",
              email: "R22subcooling@gmail.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Memphis",
                addressRegion: "TN",
                addressCountry: "US",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 35.1495,
                longitude: -90.049,
              },
              areaServed: [
                { "@type": "City", name: "Memphis" },
                { "@type": "City", name: "Germantown" },
                { "@type": "City", name: "Collierville" },
                { "@type": "City", name: "Bartlett" },
                { "@type": "City", name: "Cordova" },
                { "@type": "City", name: "Southaven" },
                { "@type": "City", name: "Olive Branch" },
              ],
              serviceType: [
                "Commercial Kitchen Appliance Maintenance",
                "Commercial Oven Repair",
                "Commercial Fryer Repair",
                "Commercial Dishwasher Service",
                "Ice Machine Maintenance",
              ],
              priceRange: "$$",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                  ],
                  opens: "07:00",
                  closes: "18:00",
                },
              ],
            }),
          }}
        />
      </head>
      <body className={inter.variable}>
        <AnnouncementBannerWrapper />
        <Header />
        <main>{children}</main>
        <Footer />
        <StickyCallBar />
      </body>
    </html>
  );
}
