import { Hero } from "@/components/sections/Hero";
import { TrustGrid } from "@/components/sections/TrustGrid";
import { ContactForm } from "@/components/sections/ContactForm";
import ServicesGrid from "@/components/sections/ServicesGrid";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <TrustGrid />
      <ServicesGrid />
      <ContactForm />
    </main>
  );
}
