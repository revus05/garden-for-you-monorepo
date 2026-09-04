"use client";

import { useEffect, useRef, useState } from "react";

const MAP_SRC =
  "https://yandex.ru/map-widget/v1/?um=constructor%3Aba6b1c13e3e2452a04495d797c70a5fb166f910d96bcdf7eab3b00209dc24a66&source=constructor";

export const YandexMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={containerRef} className="w-full aspect-[5/4]">
      {isVisible && (
        <iframe
          loading="lazy"
          title="Яндекс карта"
          src={MAP_SRC}
          width="500"
          height="400"
          className="w-full h-full"
        />
      )}
    </div>
  );
};
