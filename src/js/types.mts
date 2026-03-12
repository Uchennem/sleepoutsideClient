export interface Color {
  colorCode: string;
  colorName: string;
  colorChipImageSrc: string;
  colorPreviewImageSrc: string;
}

export interface Brand {
  id: string;
  url: string;
  productsUrl: string;
  logoSrc: string;
  name: string;
}

export interface Product {
  _id: string;
  id: string;
  isClearance: boolean;
  category: string;
  isNew: boolean;
  url: string;
  reviews: {
    reviewsUrl: string;
    reviewCount: number;
    averageRating: number;
  };
  nameWithoutBrand: string;
  name: string;
  images: {
    primarySmall: string;
    primaryMedium: string;
    primaryLarge: string;
    primaryExtraLarge: string;
    extraImages: {
      title: string;
      src: string;
    }[];
  };
  sizesAvailable: {
    zipper: string[];
  };
  colors: Color[];
  descriptionHtmlSimple: string;
  suggestedRetailPrice: number;
  brand: Brand;
  listPrice: number;
  finalPrice: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutFormData {
  fname: string;
  lname: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  cardNumber: string;
  expiration: string;
  code: string;
}

export interface Order {
  items: OrderItem[];
  orderDate: string;
  fname: string;
  lname: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  cardNumber: string;
  expiration: string;
  code: string;
  orderTotal: number;
  tax: number;
  shipping: number;
  userId: string;
}

export interface OrderResponse {
  _id: string;
  message?: string;
}
