import { useState, useCallback } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/placeholder-banner.jpg',
  className,
  style,
  ...props
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  }, [imageSrc, fallbackSrc]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={style}
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      {hasError && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
          Failed to load
        </div>
      )}
    </div>
  );
}
