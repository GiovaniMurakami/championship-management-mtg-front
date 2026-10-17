import { PageShell } from "../components/ui/PageShell";
import { SlidesHomeEditor } from "../components/landing/SlidesHomeEditor";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

export function DashboardSlidesHomePage() {
  usePageTitle(PAGE_TITLES.dashboardSlidesHome);

  return (
    <PageShell className="mx-auto max-w-5xl px-4 pb-16 pt-28">
      <header className="mb-6">
        <p className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-text-subtle">Dashboard</p>
        <h1 className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-[2.2rem] tracking-[0.04em] text-white">
          Slides da home
        </h1>
        <p className="m-0 mt-2 max-w-2xl text-[0.95rem] leading-6 text-text-soft">
          Carrossel hero da landing. Ordem = sequência do carrossel.
        </p>
      </header>
      <SlidesHomeEditor />
    </PageShell>
  );
}
