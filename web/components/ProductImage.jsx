import { useEffect, useState } from 'react';
import {
  getCategoryFallbackImage,
  getProductFallbackImage,
  getProductImageSource,
} from '../lib/productImage';

export default function ProductImage({ product, className, alt, ...props }) {
  const fallbackSrc = getProductFallbackImage(product);
  const categoryFallbackSrc = getCategoryFallbackImage(product);
  const primarySrc = getProductImageSource(product);
  const [src, setSrc] = useState(primarySrc);

  useEffect(() => {
    setSrc(primarySrc);
  }, [primarySrc]);

  return (
    <img
      {...props}
      className={className}
      src={src}
      alt={alt || product?.imageAlt || product?.name || 'Fresh produce image'}
      loading={props.loading || 'lazy'}
      onError={() => {
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
          return;
        }

        if (src !== categoryFallbackSrc) {
          setSrc(categoryFallbackSrc);
        }
      }}
    />
  );
}
