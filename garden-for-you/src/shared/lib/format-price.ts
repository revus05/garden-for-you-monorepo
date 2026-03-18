const priceFormatter = new Intl.NumberFormat("ru-BY", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPrice = (value: number | null | undefined) => {
  return `${priceFormatter.format(value ?? 0)} BYN`;
};
