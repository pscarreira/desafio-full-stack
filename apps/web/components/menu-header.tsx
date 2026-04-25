'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { authService } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { TypographyH3 } from "./ui/typography";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

function handleLogout() {
  authService.logout();
  window.location.href = '/';
}

const navLinkClass = cn(
  navigationMenuTriggerStyle(),
  "text-primary-foreground hover:bg-transparent hover:text-primary-foreground hover:border-b-2 hover:border-primary-foreground focus:bg-transparent focus:text-primary-foreground data-active:bg-transparent data-active:text-primary-foreground data-active:border-b-2 data-active:border-primary-foreground data-[popup-open]:bg-transparent rounded-none"
);

export default function MenuHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "relative flex h-16 w-full items-center justify-between px-6 text-primary-foreground bg-primary",
        className
      )}
      {...props}
    >
      <TypographyH3
        className="text-base sm:text-lg md:text-2xl"
        aria-label="painel de dados de crianças do Rio de Janeiro"
      >
        Dados de Crianças do Rio de Janeiro
      </TypographyH3>

      {/* Desktop Navigation */}
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavigationMenuLink
              render={<Link href="/dashboard" />}
              className={navLinkClass}
              active={pathname === '/dashboard'}
              aria-label="Dashboard"
            >
              Dashboard
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={<Link href="/children-list" />}
              className={navLinkClass}
              active={pathname.startsWith('/children-list')}
              aria-label="Listagem de crianças"
            >
              Crianças
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button
              variant="destructive"
              size="default"
              onClick={handleLogout}
              aria-label="Sair"
            >
              Sair
            </Button>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile - menu estilo hamburguer */}
      <button
        type="button"
        className="md:hidden rounded-md p-2 hover:bg-primary-foreground/20 transition-colors"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Menu a abrir no mobile */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 z-50 flex flex-col gap-2 bg-primary p-4 shadow-md md:hidden">
          <Button
            variant="secondary"
            className="w-full justify-start"
            render={<Link href="/dashboard" aria-label="Dashboard" />}
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start"
            render={<Link href="/children-list" aria-label="Listagem de crianças" />}
            onClick={() => setMobileOpen(false)}
          >
            Crianças
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => { handleLogout(); setMobileOpen(false); }}
            aria-label="Sair"
          >
            Sair
          </Button>
        </div>
      )}
    </header>
  );
}