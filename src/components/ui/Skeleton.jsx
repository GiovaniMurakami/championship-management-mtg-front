const shimmer =
  "bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.04)_75%)] bg-[length:200%_100%] animate-[skeleton-shimmer_1.5s_ease-in-out_infinite]";

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
    <div className="border border-[rgba(217,180,255,0.2)] rounded-lg overflow-hidden bg-[rgba(15,10,29,0.84)]">
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

export function SkeletonTorneioCard() {
  return (
    <div className="bg-gradient-to-br from-[#2a2a3e] to-[#1e1e2e] rounded-xl p-6 border border-white/10 flex flex-col gap-[0.65rem]">
      <Skeleton width="60%" height="1.3rem" />
      <Skeleton width="40%" height="0.9rem" />
      <Skeleton width="50%" height="0.9rem" />
      <Skeleton width="35%" height="0.9rem" />
      <Skeleton width="45%" height="0.9rem" />
      <div className="flex gap-3 mt-2">
        <Skeleton width="100px" height="2rem" radius="0.6rem" />
      </div>
    </div>
  );
}

export function SkeletonBannerCard() {
  return (
    <div className="border border-[rgba(217,180,255,0.2)] rounded-[1.1rem] p-5 bg-[linear-gradient(160deg,rgba(28,16,55,0.97),rgba(18,10,36,0.97))] flex flex-col gap-[0.65rem]">
      <div className="flex justify-between items-center">
        <Skeleton width="70px" height="1.35rem" radius="999px" />
        <Skeleton width="110px" height="1.1rem" radius="999px" />
      </div>
      <Skeleton width="80%" height="1.6rem" radius="0.4rem" />
      <Skeleton width="55%" height="0.85rem" radius="0.3rem" />
      <div className="pt-[0.65rem] border-t border-[rgba(217,180,255,0.2)] mt-[0.1rem]">
        <Skeleton width="65%" height="0.85rem" radius="0.3rem" />
      </div>
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
          <div className="border border-[rgba(217,180,255,0.18)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.55),rgba(15,10,29,0.8))] flex flex-col gap-4">
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
          <div className="border border-[rgba(217,180,255,0.18)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.55),rgba(15,10,29,0.8))] flex flex-col gap-4">
            <Skeleton width="120px" height="1.15rem" radius="0.4rem" />
            <Skeleton width="68%" height="0.9rem" />
            <Skeleton width="52%" height="0.9rem" />
            <Skeleton width="100%" height="2.4rem" radius="0.7rem" />
          </div>
        </div>

        {/* Right: tables + standings */}
        <div className="flex flex-col gap-6">
          {/* MatchTablesPanel */}
          <div className="border border-[rgba(217,180,255,0.18)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.55),rgba(15,10,29,0.8))] flex flex-col gap-3">
            <Skeleton width="110px" height="1.15rem" radius="0.4rem" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width="100%" height="2.2rem" radius="0.5rem" />
            ))}
          </div>

          {/* StandingsTable */}
          <div className="border border-[rgba(217,180,255,0.18)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.55),rgba(15,10,29,0.8))] flex flex-col gap-3">
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
