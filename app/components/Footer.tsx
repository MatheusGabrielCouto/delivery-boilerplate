"use client";

interface FooterProps {
  copyright: string;
}

export function Footer({ copyright }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50 py-6 pb-24 lg:pb-6">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-xs font-medium text-[var(--theme-foreground-muted)] sm:text-sm">
          © {year} {copyright}
        </p>
      </div>
    </footer>
  );
}
