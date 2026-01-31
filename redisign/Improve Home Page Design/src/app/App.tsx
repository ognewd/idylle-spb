import { Header } from "@/app/components/Header";
import { HeroSection } from "@/app/components/HeroSection";
import { FeaturesSection } from "@/app/components/FeaturesSection";
import { ProductGallery } from "@/app/components/ProductGallery";
import { CategoriesSection } from "@/app/components/CategoriesSection";
import { Footer } from "@/app/components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProductGallery />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
}