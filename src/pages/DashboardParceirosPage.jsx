import { PageShell } from "../components/ui/PageShell";
import { ParceirosEditor } from "../components/landing/ParceirosEditor";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

export function DashboardParceirosPage() {
  usePageTitle(PAGE_TITLES.dashboardParceiros);

  return (
    <PageShell className="mx-auto max-w-5xl px-4 pb-16 pt-28">
      <header className="mb-6">
        <p className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-text-subtle">Dashboard</p>
        <h1 className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-[2.2rem] tracking-[0.04em] text-white">
          Parceiros
        </h1>
        <p className="m-0 mt-2 max-w-2xl text-[0.95rem] leading-6 text-text-soft">
          Logos exibidos na home e em /parceiros.
        </p>
      </header>
      <ParceirosEditor />
    </PageShell>
  );
}
