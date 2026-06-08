import { useState } from 'react';

const PLACEHOLDER_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#eef2f7"/>
      <path d="M160 310l84-90 68 72 45-48 123 130H160z" fill="#cbd5e1"/>
      <circle cx="438" cy="152" r="42" fill="#dbe3ee"/>
      <text x="320" y="420" text-anchor="middle" fill="#64748b" font-family="Arial" font-size="22">EZShop</text>
    </svg>
  `);

export default function SafeImage({ src, alt, ...props }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(src));
  const imgSrc = !src || hasError ? PLACEHOLDER_SVG : src;

  return (
    <img
      src={imgSrc}
      alt={alt || 'Hình ảnh sản phẩm'}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
      }}
      onLoad={() => setIsLoading(false)}
      {...props}
      style={{
        ...props.style,
        opacity: isLoading && !hasError ? 0.72 : props.style?.opacity,
      }}
    />
  );
}
