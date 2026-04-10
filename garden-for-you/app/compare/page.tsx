import type { Metadata } from "next";
import ComparePageView from "@/pages/compare";

export const metadata: Metadata = {
  title: "Сравнение товаров",
  robots: { index: false, follow: false },
};

const ComparePage = () => {
  return <ComparePageView />;
};

export default ComparePage;
