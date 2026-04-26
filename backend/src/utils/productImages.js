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
  watermelon:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Sliced_Watermelon.jpg/1280px-Sliced_Watermelon.jpg',
  'pink-guava':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Guava_fruit.jpg/1280px-Guava_fruit.jpg',
  'dragon-fruit':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/A_dragon_fruit.jpg/1280px-A_dragon_fruit.jpg',
};

const PRODUCT_SLUG_ALIASES = {
  guava: 'pink-guava',
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

export const normalizeProductSlug = (name = '') => {
  const slug = slugifyProductName(name);
  return PRODUCT_SLUG_ALIASES[slug] || slug;
};

export const getProductImagePath = (product = {}) => {
  const slug = normalizeProductSlug(product.name);

  if (!KNOWN_PRODUCT_SLUGS.has(slug)) {
    return '';
  }

  if (REMOTE_PRODUCT_IMAGE_URLS[slug]) {
    return REMOTE_PRODUCT_IMAGE_URLS[slug];
  }

  return `/product-images/${slug}.jpg`;
};

const getRequestOrigin = (req) => {
  const forwardedProto = req.get('x-forwarded-proto');
  const protocol = forwardedProto ? forwardedProto.split(',')[0].trim() : req.protocol;
  return `${protocol}://${req.get('host')}`;
};

export const absolutizeImageUrl = (req, imageUrl = '') => {
  if (!imageUrl) {
    return imageUrl;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${getRequestOrigin(req)}${imageUrl}`;
  }

  return imageUrl;
};

export const resolveProductImageUrl = (req, product = {}) => {
  const explicitImageUrl = (product.imageUrl || product.image || '').trim();
  const slug = normalizeProductSlug(product.name);
  const localImagePath = getProductImagePath(product);

  if (REMOTE_PRODUCT_IMAGE_URLS[slug]) {
    return REMOTE_PRODUCT_IMAGE_URLS[slug];
  }

  if (!explicitImageUrl || UNRELIABLE_PEXELS_PATTERN.test(explicitImageUrl)) {
    return localImagePath ? absolutizeImageUrl(req, localImagePath) : explicitImageUrl;
  }

  return absolutizeImageUrl(req, explicitImageUrl);
};
