const PRODUCT_CATEGORY_FALLBACKS = {
  Fruit: '/images/produce-fallback-fruit.png',
  Vegetable: '/images/produce-fallback-vegetable.png',
};

const KNOWN_PRODUCT_SLUGS = new Set([
  'roma-tomatoes',
  'broccoli-crowns',
  'english-cucumbers',
  'baby-spinach',
  'rainbow-bell-peppers',
  'red-onions',
  'sweet-corn-cobs',
  'purple-cabbage',
  'alphonso-mango',
  'cavendish-banana',
  'green-grapes',
  'pomegranate',
  'watermelon',
  'strawberries',
  'pink-guava',
  'dragon-fruit',
]);

const REMOTE_PRODUCT_IMAGE_URLS = {
  pomegranate:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Pomegranate.jpg/1024px-Pomegranate.jpg',
  watermelon:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Sliced_Watermelon.jpg/1280px-Sliced_Watermelon.jpg',
  'pink-guava':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Guava_fruit.jpg/1280px-Guava_fruit.jpg',
  'dragon-fruit':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/A_dragon_fruit.jpg/1280px-A_dragon_fruit.jpg',
};

const UNRELIABLE_PEXELS_PATTERN =
  /^https:\/\/images\.pexels\.com\/photos\/(\d+)\/pexels-photo-\1\.(?:jpeg|jpg|png)(?:\?.*)?$/i;

export const slugifyProductName = (name = '') =>
  name
    .toString()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getCategoryFallbackImage = (product) =>
  PRODUCT_CATEGORY_FALLBACKS[product?.category] || PRODUCT_CATEGORY_FALLBACKS.Vegetable;

export const getLocalProductImage = (product = {}) => {
  const slug = slugifyProductName(product.name);

  if (!KNOWN_PRODUCT_SLUGS.has(slug)) {
    return '';
  }

  if (REMOTE_PRODUCT_IMAGE_URLS[slug]) {
    return REMOTE_PRODUCT_IMAGE_URLS[slug];
  }

  return `/product-images/${slug}.jpg`;
};

export const getProductFallbackImage = (product) =>
  getLocalProductImage(product) || getCategoryFallbackImage(product);

export const getProductImageSource = (product) => {
  const candidate = (product?.imageUrl || product?.image || '').trim();

  if (!candidate || UNRELIABLE_PEXELS_PATTERN.test(candidate)) {
    return getProductFallbackImage(product);
  }

  return candidate;
};
