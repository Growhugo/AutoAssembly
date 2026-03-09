"use client";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-cca-blue to-cca-green px-4 py-6 text-white shadow-lg">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
            A
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AutoAssembly</h1>
            <p className="text-sm text-white/80">
              CCA Assembly Report Generator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
