export type CustomOption<T extends string | number | symbol> = {
  label: string;
  value: T;
};
