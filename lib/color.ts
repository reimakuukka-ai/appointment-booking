// Laskee brändivärin tumman/vaalean/keskisävyn automaattisesti yhdestä
// HEX-pääväristä, jotta uuden organisaation tarvitsee asettaa vain yksi
// väri (NEXT_PUBLIC_BRAND_COLOR) eikä muokata CSS-tiedostoa käsin.

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '').trim();
  const full = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned;
  const num = parseInt(full, 16);
  if (Number.isNaN(num) || full.length !== 6) {
    return [40, 71, 52]; // fallback: oletusvihreä jos HEX on virheellinen
  }
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
}

function mixTowards(hex: string, target: [number, number, number], amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [tr, tg, tb] = target;
  return rgbToHex([
    r + (tr - r) * amount,
    g + (tg - g) * amount,
    b + (tb - b) * amount,
  ]);
}

export function darken(hex: string, amount: number): string {
  return mixTowards(hex, [0, 0, 0], amount);
}

export function lighten(hex: string, amount: number): string {
  return mixTowards(hex, [255, 255, 255], amount);
}

export interface BrandShades {
  brand: string;
  brandDark: string;
  brandLight: string;
  brandMid: string;
}

export function brandShades(brandColor: string): BrandShades {
  return {
    brand: brandColor,
    brandDark: darken(brandColor, 0.22),
    brandMid: lighten(brandColor, 0.13),
    brandLight: lighten(brandColor, 0.92),
  };
}
