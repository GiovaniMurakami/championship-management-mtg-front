import { Hero, TournamentSection, SponsorSection } from "../components";

export function Home({ onOpenAuth, isAuthenticated }) {
  return (
    <main className="w-[min(1100px,calc(100vw-2rem))] mx-auto pt-[7.5rem] pb-12">
      <SponsorSection />
      <Hero onOpenAuth={onOpenAuth} isAuthenticated={isAuthenticated} />
      <TournamentSection />
    </main>
  );
}
