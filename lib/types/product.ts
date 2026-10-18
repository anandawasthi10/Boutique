/**
 * Product & Category Types
 * Conforms to Frontend Specification Section 8
 */

export type OptionGroupType = 'swatch' | 'colour' | 'chips' | 'toggle';

export interface Option {
  id: string;
  label: string;
  priceDelta: number;
  available: boolean;
  unavailableReason?: string;
  swatchImageUrl?: string;
  colourValue?: string;
  previewImageUrl?: string;
  detail?: string;
}

export interface OptionGroup {
  id: string;
  label: string;
  type: OptionGroupType;
  required: boolean;
  options: Option[];
  defaultOptionId?: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

// CONTRACT-GAP (CG-04): Category metadata fields (slug, description, image, sortOrder)
export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder?: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  images: ProductImage[];
  category: {
    id: string;
    name: string;
  };
  active?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  basePrice: number;
  images: ProductImage[];
  optionGroups: OptionGroup[];
  active?: boolean;
}

// CONTRACT-GAP (CG-12): "newest" sort option removed because contract lacks product creation date field
export interface ProductsQueryParams {
  category?: string;
  search?: string;
  fabric?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: 'price_asc' | 'price_desc' | 'name';
  page?: number;
  pageSize?: number;
}

// CONTRACT-GAP (CG-05): pagination envelope structure (pageSize, totalPages)
export interface ProductsResponse {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
