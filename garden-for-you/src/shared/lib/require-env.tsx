export const requireEnv = (name: string, value: string | undefined): string => {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};
