"use client";

import { Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SignOutButton } from "@/features/user/sign-out";
import { paths } from "@/shared/constants/navigation";
import { useAppSelector } from "@/shared/lib";
import { Button, Separator } from "@/shared/ui";
import { NavItems } from "./nav-items";

function UserInitialsSmall({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return (
    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {initials || <User className="size-5 text-muted-foreground" />}
    </div>
  );
}

export const MobileMenu = () => {
  const user = useAppSelector((state) => state.userSlice.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleResize = () => {
      setIsMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyMarginRight = body.style.marginRight;
    const previousHtmlOverflow = html.style.overflow;

    if (isMenuOpen) {
      const scrollbarWidth = window.innerWidth - html.clientWidth;

      body.style.overflow = "hidden";
      html.style.overflow = "hidden";

      if (scrollbarWidth > 0) {
        body.style.marginRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.marginRight = previousBodyMarginRight;
      html.style.overflow = previousHtmlOverflow;
    };
  }, [isMenuOpen]);

  return (
    <>
      <Button
        variant="ghost"
        className="lg:hidden flex order-3 size-8"
        onClick={() => setIsMenuOpen(true)}
        aria-label="Открыть меню"
        aria-expanded={isMenuOpen}
      >
        <Menu />
      </Button>
      {isMounted &&
        createPortal(
          <>
            <div
              className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
                isMenuOpen
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              className={`fixed top-0 right-0 z-50 flex h-dvh w-full max-w-sm flex-col bg-background px-6 py-5 shadow-2xl transition-transform duration-300 lg:hidden ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="mb-8 flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Закрыть меню"
                >
                  <X />
                </Button>
              </div>

              {user ? (
                <div className="mb-4">
                  <Link
                    href={paths.profile}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 rounded-lg transition-colors hover:bg-background-secondary"
                  >
                    <UserInitialsSmall
                      name={
                        user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.email || "Покупатель"
                      }
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">
                        {user.first_name || "Мой профиль"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        Перейти в профиль
                      </p>
                    </div>
                  </Link>
                  <Separator className="mt-4" />
                </div>
              ) : (
                <div className="mb-6 pb-6">
                  <Button
                    asChild
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href={paths.signIn}>Войти в аккаунт</Link>
                  </Button>
                  <Separator className="mt-6" />
                </div>
              )}

              <nav className="flex-1">
                <ul className="flex flex-col gap-3 text-lg">
                  <NavItems onItemClick={() => setIsMenuOpen(false)} />
                </ul>
              </nav>

              {user && (
                <div className="border-t pt-3">
                  <SignOutButton
                    className="w-full"
                    callback={() => setIsMenuOpen(false)}
                  />
                </div>
              )}
            </div>
          </>,
          document.body,
        )}
    </>
  );
};
