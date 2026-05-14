export interface Product {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  image_url: string;
  description: string;
  in_stock: boolean;
  scent_family: string[];
  season: string[];
  intensity: 'light' | 'moderate' | 'strong';
  occasion: string[];
  accords: { name: string; color: string }[];
  prices: {
    musk?: Record<string, number>;
    spray?: Record<string, number>;
  };
}

export interface Order {
  id: string;
  order_number: string;
  items: any[];
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}
