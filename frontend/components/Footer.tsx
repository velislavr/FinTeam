const techs = [
  "LangGraph",
  "OpenAI",
  "FastAPI",
  "Next.js",
  "Redis",
  "Alpaca",
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-6 px-6">
      <div className="flex items-center justify-center gap-1 text-xs text-neutral-600">
        <span>Powered by</span>
        {techs.map((t, i) => (
          <span key={t}>
            <span className="text-neutral-500">{t}</span>
            {i < techs.length - 1 && <span className="mx-1 text-neutral-700">&middot;</span>}
          </span>
        ))}
      </div>
      <p className="text-center text-xs text-neutral-600 mt-2">
        Not financial advice. For informational and educational purposes only.
      </p>
    </footer>
  );
}
