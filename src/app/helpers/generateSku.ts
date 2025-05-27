// function generateSku(businessName: string): string {
//   const prefix = businessName.slice(0, 2).toUpperCase();
//   const digitCount = Math.floor(Math.random() * 3) + 8;
//   const randomDigits = Array.from({ length: digitCount }, () =>
//     Math.floor(Math.random() * 10).toString(),
//   ).join("");
//   return `${prefix}${randomDigits}`;
// }

// console.log(generateSku("Oneflare"))