"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/ui";
import { NavItems } from "./nav-items";

export const MobileMenu = () => {
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
        className="lg:hidden flex"
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
              <div className="mb-8 flex items-center justify-between">
                <span className="text-lg font-semibold">Меню</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Закрыть меню"
                >
                  <X />
                </Button>
              </div>
              <nav className="flex-1">
                <ul className="flex flex-col gap-6 text-lg">
                  <NavItems onItemClick={() => setIsMenuOpen(false)} />
                </ul>
              </nav>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};
