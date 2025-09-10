
import Link from 'next/link';
import { ScanText, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ScanText className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">ParseWise</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/invoices"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Invoices
            </Link>
          </nav>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center space-x-2">
                <ScanText className="h-6 w-6 text-primary" />
                <span className="font-bold">ParseWise</span>
              </Link>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/"
                    className="transition-colors hover:text-foreground/80"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/invoices"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Invoices
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Future user auth button can go here */}
        </div>
      </div>
    </header>
  );
}
