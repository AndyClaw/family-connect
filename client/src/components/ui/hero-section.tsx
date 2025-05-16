import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  backgroundImageUrl?: string;
}

export function HeroSection({
  title,
  subtitle,
  buttonText,
  buttonLink,
  backgroundImageUrl = "https://pixabay.com/get/gcff190f8ee8396e622e0ded8e476dd586925b6117f994599260f2e746d94131920c59c8ce63a9d7010885c86a3bfc7f21508bb54a1e0a9f289fe529685b65b25_1280.jpg"
}: HeroSectionProps) {
  return (
    <div className="relative bg-accent-600">
      <div className="h-64 md:h-80 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <img className="w-full h-full object-cover" src={backgroundImageUrl} alt="Family gathering" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 max-w-3xl">{title}</h1>
          <p className="text-lg text-white max-w-2xl">{subtitle}</p>
          <div className="mt-6">
            <Button asChild>
              <Link href={buttonLink}>
                <a className="bg-warmth-500 hover:bg-warmth-600">{buttonText}</a>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
