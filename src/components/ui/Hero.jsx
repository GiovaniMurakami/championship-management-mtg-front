export function Hero() {
  return (
    <section className="relative overflow-hidden border border-[rgba(217,180,255,0.2)] rounded-3xl p-[clamp(1.4rem,3vw,2.8rem)] mb-10 bg-[radial-gradient(circle_at_85%_5%,rgba(123,34,246,0.42),transparent_40%),radial-gradient(circle_at_10%_90%,rgba(81,24,164,0.52),transparent_35%),linear-gradient(135deg,#100a1f,#140d2a_48%,#1a0f34)]">
      <p className="m-0 text-[#c795ff] font-['Bebas_Neue',sans-serif] tracking-[0.12em] text-[1.1rem]">
        Liga competitiva de Magic
      </p>
      <h1 className="mt-[0.6rem] mb-[0.8rem] mx-0 max-w-[760px] text-[clamp(2.2rem,5vw,4rem)] leading-[0.95] font-['Bebas_Neue',sans-serif] tracking-[0.03em]">
        Torneios com energia de stream, foco competitivo e a vibe da cena BR.
      </h1>
      <p className="m-0 max-w-[700px] text-[#beafd7]">
        Enquanto o painel de torneios nao chega, estamos exibindo banners mockados para a
        comunidade ja ir sentindo o clima dos proximos eventos.
      </p>
    </section>
  );
}
