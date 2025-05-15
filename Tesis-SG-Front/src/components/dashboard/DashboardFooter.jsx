export default function DashboardFooter() {
  return (
<footer className="w-full text-center text-xs text-zinc-600 py-4 bg-white/60 backdrop-blur-sm border-t border-zinc-200 shadow-sm">

      © 2025 SG CONSULTING GROUP ·{" "}
      <a
        href="/legal/privacidad"
        className="underline hover:text-indigo-600 transition-colors"
        target="_blank"
        rel="noreferrer"
      >
        Política de Privacidad
      </a>
    </footer>
  );
}
