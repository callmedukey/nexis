export const generateProductId = (number: number) => {
  return `${number.toString().padStart(5, "0")}`;
};
