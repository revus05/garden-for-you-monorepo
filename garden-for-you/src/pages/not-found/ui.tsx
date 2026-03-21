import Image from "next/image";
import Link from "next/link";
import { paths } from "shared/constants/navigation";
import { Button } from "shared/ui/button";
import { withHomeLayout } from "widgets/layouts/home";
import notFoundImage from "../../../public/image/404.svg";

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
