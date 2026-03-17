import plantsPattern from "../../../../public/image/plants-pattern.png";

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundImage: `url(${plantsPattern.src}),linear-gradient(oklch(0.3762 0.0406 142.18),oklch(0.3762 0.0406 142.18))`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "var(-primary)",
      }}
    >
      footer
    </footer>
  );
};
