import { Hero, TournamentSection, SponsorSection } from "../components";

export function Home() {
  return (
    <main className="w-[min(1100px,calc(100vw-2rem))] mx-auto pt-[7.5rem] pb-12">
      <SponsorSection />
      <Hero />
      <TournamentSection />
    </main>
  );
}
