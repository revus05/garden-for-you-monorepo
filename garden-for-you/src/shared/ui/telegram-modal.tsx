"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import telegram from "@/images/telegram.svg";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

interface TelegramModalProps {
  telegramUrl: string;
  children?: React.ReactNode;
}

export const TelegramModal = ({ telegramUrl, children }: TelegramModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(telegramUrl)}`;

  const trigger = children ?? (
    <button type="button" className="hover:opacity-80 transition-opacity cursor-pointer">
      <Image src={telegram} width={32} height={32} alt="telegram" />
    </button>
  );

  if (!mounted) {
    return <>{trigger}</>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xs text-center">
        <DialogHeader>
          <DialogTitle className="text-center">Telegram</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <Image
            src={qrUrl}
            width={200}
            height={200}
            alt="QR-код Telegram"
            className="rounded-lg"
            unoptimized
          />
          <div className="relative w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground shrink-0">или</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <Button asChild className="w-full">
            <Link href={telegramUrl} target="_blank" rel="noopener noreferrer">
              Открыть в Telegram
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
