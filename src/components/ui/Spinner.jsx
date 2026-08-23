export function Spinner({ size = 36, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-text-soft">
      <div
        className="border-3 border-line border-t-[#c795ff] rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
      {text && <p className="m-0 text-[0.95rem]">{text}</p>}
    </div>
  );
}
