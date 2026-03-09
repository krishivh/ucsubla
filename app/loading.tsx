export default function Loading() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background app-container">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-uclaBlue flex items-center justify-center animate-pulse">
            <span className="text-2xl">🎓</span>
          </div>
          <div className="w-32 h-1.5 rounded-full overflow-hidden bg-gray-200">
            <div className="h-full bg-uclaBlue rounded-full" style={{
              animation: 'loadingBar 1.2s ease-in-out infinite',
            }} />
          </div>
        </div>
        <style>{`
          @keyframes loadingBar {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
      </div>
    );
  }