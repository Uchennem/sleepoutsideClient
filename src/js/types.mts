export interface Color {
  colorCode: string;
  colorName: string;
}

export interface Brand {
  id: string;
  /** Optional - some entries may not include a logo */
  logoSrc?: string;
  name: string;
}

export interface Product {
  id: string;
  nameWithoutBrand: string;
  name: string;
  image: string;
  sizesAvailable: Record<string, unknown>;
  colors: Color[];
  descriptionHtmlSimple: string;
  suggestedRetailPrice: number;
  brand: Brand;
  listPrice: number;
  finalPrice: number;
  /** Optional flags present on some products */
  isFamousBrand?: boolean;
}
