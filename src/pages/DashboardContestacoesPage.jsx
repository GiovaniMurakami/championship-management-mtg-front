import { ContestacoesAdminPanel } from "../components/ranqueada/ContestacoesAdminPanel";
import { PageShell } from "../components/ui/PageShell";
import { PAGE_TITLES } from "../constants/pageTitles";
import { usePageTitle } from "../hooks/usePageTitle";

export function DashboardContestacoesPage() {
  usePageTitle(PAGE_TITLES.dashboardContestacoes);

  return (
    <PageShell>
      <div className="mb-6">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-brand">Admin</p>
        <h1 className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-4xl tracking-[0.04em] text-text-main">
          Contestações
        </h1>
        <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-[#b9abd8]">
          Analise contestações de resultado e divergências de deck das partidas ranqueadas.
        </p>
      </div>
      <ContestacoesAdminPanel />
    </PageShell>
  );
}
