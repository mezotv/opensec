import { EventTicker } from "@/components/event-ticker";
import { Footer } from "@/components/footer";
import { LandingHero } from "@/components/landing-hero";

export const revalidate = 1200;

export default function Home() {
  return (
    <main className="-mt-16 flex flex-1 flex-col bg-background text-foreground">
      <LandingHero />
      <EventTicker />
      <Footer />
    </main>
  );
}
