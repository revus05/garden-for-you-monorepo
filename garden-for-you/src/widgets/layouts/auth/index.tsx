import type { ComponentType, ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

async function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex flex-col grow items-center justify-center">
        {children}
      </main>
    </div>
  );
}

export const withAuthLayout = <P extends object>(
  Component: ComponentType<P>,
) => {
  const WrappedComponent = async (props: P) => (
    <AuthLayout>
      <Component {...props} />
    </AuthLayout>
  );

  WrappedComponent.displayName = `withAuthLayout(${Component.displayName || Component.name || "Component"})`;

  return WrappedComponent;
};
