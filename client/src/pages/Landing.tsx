import { HeroSection } from "@/components/ui/hero-section";
import FeatureSection from "@/components/features/FeatureSection";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  // If authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div>
      <HeroSection 
        title="Keep Your Family Connected, No Matter The Distance"
        subtitle="Share life updates, important dates, and memories with your loved ones in a private, secure space."
        buttonText="Get Started"
        buttonLink="/api/login"
      />
      
      <div id="get-started">
        <FeatureSection />
      </div>
    </div>
  );
}
