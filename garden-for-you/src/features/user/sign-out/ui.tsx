import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useState } from "react";
import { toast } from "sonner";
import { signOut } from "@/entities/user";
import { signOutRequest } from "@/features/user/sign-out/api";
import { paths } from "@/shared/constants/navigation";
import { cn, useAppDispatch } from "@/shared/lib";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@/shared/ui";

type SignOutButtonProps = {
  callback?: () => void;
  className?: string;
};

export const SignOutButton: FC<SignOutButtonProps> = ({
  callback,
  className,
}) => {
  const dispatch = useAppDispatch();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOutRequest();
      dispatch(signOut());
      void router.push(paths.home);
      if (callback) {
        callback();
      }
    } catch {
      toast.error("Ошибка при выходе из аккаунта");
      setIsSigningOut(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn("mt-auto w-fit", className)}
          disabled={isSigningOut}
        >
          <LogOut className="size-4" />
          {isSigningOut ? "Выход..." : "Выйти из аккаунта"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы будете перенаправлены на главную страницу.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" size="sm" className="mt-auto">
              Отмена
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleSignOut}>
            Выйти
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
