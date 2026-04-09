import type { FC } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui";

type CatalogTabsProps = {
  activeTab: "seedlings" | "fertilizer";
  setActiveTab: (value: "seedlings" | "fertilizer") => void;
};

export const CatalogTabs: FC<CatalogTabsProps> = ({
  setActiveTab,
  activeTab,
}) => (
  <Tabs
    defaultValue="seedlings"
    value={activeTab}
    onValueChange={(tab) => setActiveTab(tab as "seedlings" | "fertilizer")}
    className="md:justify-self-center"
  >
    <TabsList className="w-full md:w-auto">
      <TabsTrigger value="seedlings" className="flex-1 md:flex-none">
        Саженцы
      </TabsTrigger>
      <TabsTrigger value="fertilizer" className="flex-1 md:flex-none" disabled>
        Удобрения
      </TabsTrigger>
    </TabsList>
  </Tabs>
);
