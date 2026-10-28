export type Product = {
  id: string;
  slug: string;
  name: string;
  /** Price in LKR */
  price: number;
  /** Optional original price, shown struck through when higher than `price` */
  compareAtPrice?: number | null;
  category: string;
  description: string;
  /** Bullet points such as fabric, fit, print method */
  details: string[];
  sizes: string[];
  colors: string[];
  /** Image URLs. The first is the cover, the second is shown on hover. */
  images: string[];
  isNew: boolean;
  featured: boolean;
  soldOut: boolean;
  /** Hidden products are only visible in the admin panel */
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string };

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string | null;
  color: string | null;
  qty: number;
};
