const GlassLoader = ({ message = "Procesando...", visible = false }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/20 backdrop-blur-xl p-6 rounded-2xl border border-white/30 shadow-xl flex flex-col items-center gap-4 w-[300px] text-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default GlassLoader;
