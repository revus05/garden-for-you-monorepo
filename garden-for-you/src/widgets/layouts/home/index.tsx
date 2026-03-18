import type { ComponentType, ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

type HomeLayoutProps = {
  children: ReactNode;
};

async function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col gap-8">
      <Header />
      <main className="flex flex-col grow">{children}</main>
      <Footer />
    </div>
  );
}

export const withHomeLayout = <P extends object>(
  Component: ComponentType<P>,
) => {
  const WrappedComponent = async (props: P) => (
    <HomeLayout>
      <Component {...props} />
    </HomeLayout>
  );

  WrappedComponent.displayName = `withHomeLayout(${Component.displayName || Component.name || "Component"})`;

  return WrappedComponent;
};
