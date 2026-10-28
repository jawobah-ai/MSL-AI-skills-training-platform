import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { signOut } from "@/app/actions";
import { CONTENT_REVIEW_STATUS, CONTENT_VERSION } from "@/lib/content/gates";
import { getCurrentUser } from "@/lib/session";
import { isDemoMode } from "@/lib/store";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MSL AI Skills",
  description: "Hands-on, compliance-first AI skills for Medical Science Liaisons.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <header className="border-b border-line bg-surface">
          <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-4">
            <Link href={user ? (user.role === "grader" ? "/grade" : "/learn") : "/"} className="font-semibold tracking-tight">
              MSL AI Skills
            </Link>
            {isDemoMode && (
              <span className="text-xs rounded-full bg-warn-soft text-warn px-2 py-0.5">Demo mode · local data</span>
            )}
            <nav className="ml-auto flex items-center gap-4 text-sm">
              {user?.role === "grader" && (
                <>
                  <Link href="/grade" className="text-muted hover:text-foreground">Grading queue</Link>
                  <Link href="/audit" className="text-muted hover:text-foreground">Audit log</Link>
                </>
              )}
              {user && (
                <>
                  <span className="text-muted hidden sm:inline">{user.name}</span>
                  <form action={signOut}>
                    <button className="text-muted hover:text-foreground">Sign out</button>
                  </form>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-8 flex-1">{children}</main>
        <footer className="border-t border-line text-xs text-muted">
          <div className="mx-auto max-w-5xl px-4 py-4">
            Content v{CONTENT_VERSION} · {CONTENT_REVIEW_STATUS}. Training material only; follow your company&apos;s SOPs. All cases and data are synthetic.
          </div>
        </footer>
      </body>
    </html>
  );
}
