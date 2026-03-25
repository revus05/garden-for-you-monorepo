import Image from "next/image";
import Link from "next/link";
import notFoundImage from "@/images/404.svg";
import { paths } from "@/shared/constants/navigation";
import { Button } from "@/shared/ui";
import { withHomeLayout } from "@/widgets/layouts/home";

const NotFoundPage = () => {
  return (
    <div className="wrapper flex flex-col gap-12 items-center">
      <Image
        src={notFoundImage.src}
        alt="Page not found"
        width={400}
        height={200}
      />
      <Button className="w-fit" asChild>
        <Link href={paths.home}>В каталог</Link>
      </Button>
    </div>
  );
};

export default withHomeLayout(NotFoundPage);
