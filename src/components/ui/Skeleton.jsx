const shimmer = "skeleton-shimmer";

export function Skeleton({ width, height, radius = "0.5rem", className = "" }) {
  return (
    <div
      className={`${shimmer} ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="border border-line-soft rounded-2xl overflow-hidden bg-surface/70 shadow-card">
      <Skeleton width="100%" height="180px" radius="0" />
      <div className="p-6 flex flex-col gap-3">
        <Skeleton width="70%" height="1.2rem" />
        <Skeleton width="40%" height="0.9rem" />
        <div className="flex gap-3">
          <Skeleton width="45%" height="0.9rem" />
          <Skeleton width="45%" height="0.9rem" />
        </div>
        <Skeleton width="55%" height="0.85rem" />
        <div className="flex gap-3">
          <Skeleton width="48%" height="2.2rem" radius="0.6rem" />
          <Skeleton width="48%" height="2.2rem" radius="0.6rem" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonUserProfile() {
  return (
    <div className="pb-16" aria-busy="true" aria-label="Carregando perfil" role="status">
      <span className="sr-only">Carregando perfil...</span>
      <div className="mb-6 flex items-center gap-5 rounded-[1.75rem] border border-white/[0.09] bg-white/[0.04] px-7 py-8 max-sm:px-5 max-sm:py-6">
        <Skeleton width="76px" height="76px" radius="999px" className="shrink-0 max-sm:!h-16 max-sm:!w-16" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Skeleton width="min(70%, 19rem)" height="2rem" radius="0.5rem" />
          <div className="flex flex-wrap gap-2"><Skeleton width="8rem" height="1.6rem" radius="999px" /><Skeleton width="10rem" height="1.6rem" radius="999px" /><Skeleton width="7rem" height="1.6rem" radius="999px" /></div>
        </div>
      </div>
      <div className="mb-10 grid grid-cols-2 overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.035] sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex min-h-[92px] flex-col items-center justify-center gap-2 px-4"><Skeleton width="3.5rem" height="1.7rem" /><Skeleton width={`${52 + (index % 3) * 8}%`} height="0.65rem" /></div>)}
      </div>
      <Skeleton width="12rem" height="1.55rem" className="mb-2" /><Skeleton width="15rem" height="0.85rem" className="mb-5" />
      <div className="mb-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => <div key={index} className="rounded-[1.35rem] border border-white/[0.08] bg-white/[0.035] p-5"><div className="mb-3 flex items-start justify-between gap-4"><div className="flex flex-1 flex-col gap-3"><Skeleton width="35%" height="0.7rem" /><Skeleton width={`${68 + index * 7}%`} height="1rem" /></div><Skeleton width="3.5rem" height="1.5rem" /></div><Skeleton width="5rem" height="0.7rem" /><div className="mt-4 flex justify-between border-t border-white/[0.07] pt-3"><Skeleton width="6rem" height="0.7rem" /><Skeleton width="4.5rem" height="0.7rem" /></div></div>)}
      </div>
      <Skeleton width="10rem" height="1.55rem" className="mb-2" /><Skeleton width="8rem" height="0.85rem" className="mb-5" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => <div key={index} className="overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.035]"><Skeleton width="100%" height="192px" radius="0" /><div className="flex flex-col gap-3 p-5"><Skeleton width={`${62 + index * 8}%`} height="1.1rem" /><div className="flex justify-between"><Skeleton width="6rem" height="0.7rem" /><Skeleton width="5rem" height="0.7rem" /></div></div></div>)}
      </div>
    </div>
  );
}

export function SkeletonTorneioCard() {
  return (
    <div className="min-h-[330px] bg-surface/70 rounded-2xl p-4 border border-line-soft shadow-card flex flex-col gap-[0.65rem]">
      <Skeleton width="100%" height="140px" radius="0.6rem" />
      <Skeleton width="60%" height="1.1rem" />
      <Skeleton width="40%" height="0.8rem" />
      <Skeleton width="50%" height="0.8rem" />
      <Skeleton width="35%" height="0.8rem" />
      <Skeleton width="45%" height="0.9rem" />
      <div className="flex gap-3 mt-2">
        <Skeleton width="100px" height="2rem" radius="0.6rem" />
      </div>
    </div>
  );
}

export function SkeletonBannerCard() {
  return (
    <div className="border border-line rounded-xl p-5 bg-[linear-gradient(160deg,rgba(28,16,55,0.97),rgba(18,10,36,0.97))] flex flex-col gap-[0.65rem]">
      <div className="flex justify-between items-center">
        <Skeleton width="70px" height="1.35rem" radius="999px" />
        <Skeleton width="110px" height="1.1rem" radius="999px" />
      </div>
      <Skeleton width="80%" height="1.6rem" radius="0.4rem" />
      <Skeleton width="55%" height="0.85rem" radius="0.3rem" />
      <div className="pt-[0.65rem] border-t border-line mt-[0.1rem]">
        <Skeleton width="65%" height="0.85rem" radius="0.3rem" />
      </div>
    </div>
  );
}

export function SkeletonCollection({ variant = "card", count = 6, className = "" }) {
  const Card = variant === "tournament" ? SkeletonTorneioCard : SkeletonCard;
  return (
    <div
      className={`grid min-h-[650px] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 content-start ${className}`}
      aria-busy="true"
      aria-label="Carregando conteúdo"
      role="status"
    >
      <span className="sr-only">Carregando conteúdo...</span>
      {Array.from({ length: count }).map((_, index) => <Card key={index} />)}
    </div>
  );
}

export function SkeletonTeamCollection({ count = 8 }) {
  return (
    <div
      className="grid min-h-[560px] grid-cols-[repeat(auto-fill,minmax(280px,1fr))] content-start gap-4 max-[768px]:grid-cols-1"
      aria-busy="true"
      aria-label="Carregando times"
      role="status"
    >
      <span className="sr-only">Carregando times...</span>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex min-h-[176px] flex-col rounded-2xl border border-line-soft bg-surface/70 p-4 shadow-card" aria-hidden="true">
          <div className="mb-4 flex items-start gap-3">
            <Skeleton width="2.5rem" height="2.5rem" radius="0.75rem" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton width={`${52 + (index % 3) * 10}%`} height="1rem" />
              <Skeleton width="34%" height="0.7rem" />
            </div>
          </div>
          <Skeleton width="88%" height="0.8rem" className="mb-2" />
          <Skeleton width="64%" height="0.8rem" />
          <div className="mt-auto flex justify-between border-t border-line-soft pt-3">
            <Skeleton width="5rem" height="0.75rem" />
            <Skeleton width="4rem" height="0.75rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonPostFeed({ count = 3 }) {
  return (
    <div className="grid gap-7" aria-busy="true" aria-label="Carregando publicações" role="status">
      <span className="sr-only">Carregando publicações...</span>
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="overflow-hidden rounded-2xl border border-line-soft bg-surface/70 shadow-card" aria-hidden="true">
          <div className="flex items-center gap-3 p-4">
            <Skeleton width="2.5rem" height="2.5rem" radius="999px" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton width={`${30 + index * 7}%`} height="0.9rem" />
              <Skeleton width="8rem" height="0.65rem" />
            </div>
          </div>
          <Skeleton width="100%" height={index % 2 === 0 ? "420px" : "340px"} radius="0" />
          <div className="flex flex-col gap-3 p-4">
            <Skeleton width="7.5rem" height="2.75rem" radius="0.75rem" />
            <Skeleton width="88%" height="0.85rem" />
            <Skeleton width="62%" height="0.85rem" />
            <div className="mt-1 flex items-center gap-2 border-t border-line-soft pt-3">
              <Skeleton width="100%" height="2.75rem" radius="0.75rem" />
              <Skeleton width="5rem" height="2.75rem" radius="0.75rem" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function SkeletonPostDetail() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8" aria-busy="true" aria-label="Carregando publicação" role="status">
      <span className="sr-only">Carregando publicação...</span>
      <div className="mb-6 flex justify-between"><Skeleton width="7rem" height="2.75rem" radius="0.75rem" /><Skeleton width="9rem" height="2.75rem" radius="0.75rem" /></div>
      <article className="rounded-2xl border border-line-soft bg-surface/70 p-5 shadow-card" aria-hidden="true">
        <Skeleton width="12rem" height="1.6rem" className="mb-2" />
        <Skeleton width="5rem" height="0.75rem" className="mb-6" />
        <Skeleton width="82%" height="0.9rem" className="mb-3" />
        <Skeleton width="55%" height="0.9rem" className="mb-6" />
        <div className="grid grid-cols-2 items-start gap-3 max-sm:grid-cols-1">
          <Skeleton width="100%" height="360px" radius="0.75rem" />
          <Skeleton width="100%" height="280px" radius="0.75rem" />
        </div>
      </article>
    </div>
  );
}

export function SkeletonMetagameArchetype() {
  return (
    <div className="min-h-[720px] pt-4" aria-busy="true" aria-label="Carregando arquétipo" role="status">
      <span className="sr-only">Carregando arquétipo...</span>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton width="96px" height="70px" radius="0.75rem" />
          <div className="flex flex-col gap-3 pt-1">
            <Skeleton width="min(50vw, 18rem)" height="2rem" radius="0.45rem" />
            <Skeleton width="min(60vw, 25rem)" height="0.9rem" radius="0.3rem" />
          </div>
        </div>
        <Skeleton width="8rem" height="2.6rem" radius="0.75rem" />
      </div>
      <div className="mb-7 rounded-2xl border border-line-soft bg-surface/70 p-5 shadow-card">
        <Skeleton width="9rem" height="1.2rem" className="mb-5" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between rounded-xl border border-line-soft p-3">
              <Skeleton width={`${44 + index * 5}%`} height="0.9rem" />
              <Skeleton width="3.25rem" height="1rem" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton width="5rem" height="1.25rem" className="mb-3" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-line-soft bg-surface/70 p-5 shadow-card">
            <div className="mb-4 flex justify-between gap-4">
              <Skeleton width={`${35 + index * 8}%`} height="1.1rem" />
              <Skeleton width="5rem" height="1.5rem" radius="999px" />
            </div>
            <Skeleton width="100%" height="4rem" radius="0.65rem" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonMetagame() {
  return (
    <div
      className="grid min-h-[660px] grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px] animate-[fade-in_200ms_ease-out]"
      aria-busy="true"
      aria-label="Carregando metagame"
      role="status"
    >
      <span className="sr-only">Carregando metagame...</span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <article
            key={index}
            className="flex min-h-[190px] flex-col rounded-2xl border border-line-soft bg-surface/70 p-4 shadow-card"
            aria-hidden="true"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <Skeleton width={`${58 + (index % 3) * 9}%`} height="1.25rem" radius="0.4rem" />
              <Skeleton width="2.25rem" height="2.25rem" radius="999px" />
            </div>
            <Skeleton width="42%" height="0.75rem" radius="0.3rem" />
            <div className="my-4 flex items-end gap-2">
              <Skeleton width="3.5rem" height="2rem" radius="0.4rem" />
              <Skeleton width="4.5rem" height="0.8rem" radius="0.3rem" />
            </div>
            <div className="mt-auto flex flex-col gap-2 border-t border-line-soft pt-3">
              <Skeleton width="100%" height="0.55rem" radius="999px" />
              <div className="flex justify-between gap-3">
                <Skeleton width="38%" height="0.75rem" radius="0.3rem" />
                <Skeleton width="28%" height="0.75rem" radius="0.3rem" />
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="flex flex-col gap-5 lg:sticky lg:top-24" aria-hidden="true">
        <div className="flex flex-col gap-2">
          <Skeleton width="7.5rem" height="0.75rem" radius="0.3rem" />
          <Skeleton width="100%" height="2.6rem" radius="0.75rem" />
        </div>
        <div className="rounded-2xl border border-line-soft bg-surface/70 p-4 shadow-card">
          <Skeleton width="8rem" height="1.1rem" radius="0.35rem" className="mb-5" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="mb-5 flex flex-col gap-2 last:mb-0">
              <Skeleton width={`${64 + (index % 2) * 14}%`} height="0.72rem" radius="0.3rem" />
              <div className="grid grid-cols-[2.4rem_minmax(0,1fr)] gap-2">
                <Skeleton width="2rem" height="0.75rem" radius="0.25rem" />
                <Skeleton width="82%" height="0.75rem" radius="0.25rem" />
                <Skeleton width="2rem" height="0.75rem" radius="0.25rem" />
                <Skeleton width="66%" height="0.75rem" radius="0.25rem" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function SkeletonTournamentDetail() {
  return (
    <div className="flex flex-col gap-6 animate-[fade-in_300ms_ease-out]">
      {/* Header */}
      <div className="mb-2">
        <Skeleton width="110px" height="1.5rem" radius="999px" className="mb-3" />
        <Skeleton width="52%" height="2.8rem" radius="0.4rem" className="mb-5" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton width="132px" height="2rem" radius="0.75rem" />
          <Skeleton width="148px" height="2rem" radius="0.75rem" />
          <Skeleton width="124px" height="2rem" radius="0.75rem" />
          <Skeleton width="116px" height="2rem" radius="0.75rem" />
        </div>
      </div>

      {/* Round timer bar */}
      <Skeleton width="100%" height="64px" radius="0.9rem" />

      {/* Two-column main layout */}
      <div className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
        {/* Left: match + profile */}
        <div className="flex flex-col gap-6">
          {/* MatchPanel */}
          <div className="border border-line rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.55),rgba(15,10,29,0.8))] flex flex-col gap-4">
            <Skeleton width="140px" height="1.15rem" radius="0.4rem" />
            <div className="border border-[rgba(255,255,255,0.07)] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between gap-3">
                <Skeleton width="42%" height="1rem" />
                <Skeleton width="42%" height="1rem" />
              </div>
              <Skeleton width="100%" height="2rem" radius="0.5rem" />
              <div className="flex gap-2">
                <Skeleton width="50%" height="2.4rem" radius="0.7rem" />
                <Skeleton width="50%" height="2.4rem" radius="0.7rem" />
              </div>
            </div>
          </div>

          {/* PlayerProfile */}
          <div className="border border-line rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.55),rgba(15,10,29,0.8))] flex flex-col gap-4">
            <Skeleton width="120px" height="1.15rem" radius="0.4rem" />
            <Skeleton width="68%" height="0.9rem" />
            <Skeleton width="52%" height="0.9rem" />
            <Skeleton width="100%" height="2.4rem" radius="0.7rem" />
          </div>
        </div>

        {/* Right: tables + standings */}
        <div className="flex flex-col gap-6">
          {/* MatchTablesPanel */}
          <div className="border border-line rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.55),rgba(15,10,29,0.8))] flex flex-col gap-3">
            <Skeleton width="110px" height="1.15rem" radius="0.4rem" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width="100%" height="2.2rem" radius="0.5rem" />
            ))}
          </div>

          {/* StandingsTable */}
          <div className="border border-line rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.55),rgba(15,10,29,0.8))] flex flex-col gap-3">
            <Skeleton width="100px" height="1.15rem" radius="0.4rem" />
            {/* Table header row */}
            <div className="flex gap-3">
              <Skeleton width="28px" height="0.8rem" radius="0.3rem" />
              <Skeleton width="28%" height="0.8rem" radius="0.3rem" />
              <Skeleton width="10%" height="0.8rem" radius="0.3rem" />
              <Skeleton width="8%" height="0.8rem" radius="0.3rem" />
              <Skeleton width="8%" height="0.8rem" radius="0.3rem" />
              <Skeleton width="12%" height="0.8rem" radius="0.3rem" />
            </div>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton width="24px" height="1.5rem" radius="999px" />
                <Skeleton width={`${32 + (i % 3) * 8}%`} height="0.9rem" radius="0.3rem" />
                <Skeleton width="8%" height="0.9rem" radius="0.3rem" />
                <Skeleton width="6%" height="0.9rem" radius="0.3rem" />
                <Skeleton width="6%" height="0.9rem" radius="0.3rem" />
                <Skeleton width="11%" height="0.9rem" radius="0.3rem" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonSponsorSection() {
  return (
    <section className="mb-10" aria-busy="true" aria-label="Carregando patrocinadores">
      <div className="flex items-center mb-3">
        <Skeleton width="148px" height="1.5rem" radius="999px" />
      </div>

      <SkeletonCarouselPreview />
    </section>
  );
}

function SkeletonCarouselPreview() {
  return (
    <div className="relative border border-line rounded-2xl overflow-hidden bg-[linear-gradient(135deg,rgba(28,14,58,0.97)_0%,rgba(16,8,36,0.97)_100%)] shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,#2ccfb4,#7c3aed,#c795ff,#ec4899)]">
      <div className="flex items-center gap-10 px-10 pt-8 pb-6 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-5 max-[600px]:px-5 max-[600px]:pt-6 max-[600px]:pb-4">
        <Skeleton
          width="120px"
          height="120px"
          radius="1rem"
          className="shrink-0 max-[600px]:!w-[72px] max-[600px]:!h-[72px]"
        />
        <div className="flex-1 min-w-0 flex flex-col gap-3 w-full">
          <Skeleton width="100px" height="0.85rem" radius="0.3rem" />
          <Skeleton width="min(60%, 280px)" height="2rem" radius="0.4rem" />
          <Skeleton width="85%" height="0.9rem" radius="0.3rem" />
          <Skeleton width="70%" height="0.9rem" radius="0.3rem" />
          <Skeleton width="148px" height="2rem" radius="999px" className="mt-1" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 px-4 py-3 pb-4 border-t border-line">
        <Skeleton width="1.9rem" height="1.9rem" radius="999px" />
        <div className="flex gap-[0.4rem] items-center">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="7px" height="7px" radius="999px" />
          ))}
        </div>
        <Skeleton width="1.9rem" height="1.9rem" radius="999px" />
      </div>
    </div>
  );
}

function SkeletonDashboardAdCard() {
  return (
    <section className="grid gap-5 rounded-lg border border-line-soft bg-[#0b0717] p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="grid gap-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton width="7rem" height="3rem" radius="0.5rem" />
            <Skeleton width="8rem" height="2.5rem" radius="0.5rem" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton width="5.5rem" height="2.25rem" radius="0.5rem" />
            <Skeleton width="4.5rem" height="2.25rem" radius="0.5rem" />
            <Skeleton width="4.5rem" height="2.25rem" radius="0.5rem" />
            <Skeleton width="5rem" height="2.25rem" radius="0.5rem" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton width="100%" height="3.5rem" radius="0.5rem" />
          <Skeleton width="100%" height="3.5rem" radius="0.5rem" />
          <Skeleton width="100%" height="3.5rem" radius="0.5rem" />
        </div>
        <Skeleton width="100%" height="6rem" radius="0.5rem" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton width="100%" height="3.5rem" radius="0.5rem" />
          <Skeleton width="100%" height="3.5rem" radius="0.5rem" />
          <Skeleton width="100%" height="3.5rem" radius="0.5rem" />
        </div>
      </div>
      <aside className="min-w-0">
        <Skeleton width="100%" height="12.5rem" radius="0.5rem" />
      </aside>
    </section>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="animate-[fade-in_300ms_ease-out]" aria-busy="true" aria-label="Carregando dashboard">
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-line-soft bg-[#120b24] px-4 py-3">
            <Skeleton width="55%" height="0.75rem" radius="0.25rem" />
            <Skeleton width="35%" height="1.75rem" radius="0.35rem" className="mt-3" />
          </div>
        ))}
      </div>

      <section className="mb-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2 min-w-0">
            <Skeleton width="11rem" height="1.25rem" radius="0.35rem" />
            <Skeleton width="min(100%, 18rem)" height="0.9rem" radius="0.3rem" />
          </div>
          <Skeleton width="4.5rem" height="1.75rem" radius="999px" />
        </div>
        <div className="mb-3">
          <Skeleton width="9rem" height="1.5rem" radius="999px" />
        </div>
        <SkeletonCarouselPreview />
      </section>

      <div className="grid gap-4">
        <SkeletonDashboardAdCard />
        <SkeletonDashboardAdCard />
        <div className="flex flex-wrap justify-end gap-2 border-t border-line-soft pt-4">
          <Skeleton width="8.75rem" height="2.5rem" radius="0.5rem" />
          <Skeleton width="8.125rem" height="2.5rem" radius="0.5rem" />
          <Skeleton width="9.375rem" height="2.5rem" radius="0.5rem" />
        </div>
      </div>
    </div>
  );
}
