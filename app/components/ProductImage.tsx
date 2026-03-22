"use client";

import { useState } from "react";
import Image from "next/image";
import { FiImage } from "react-icons/fi";

interface ProductImageProps {
  src: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

const Placeholder = () => (
  <div className="flex h-full w-full items-center justify-center bg-neutral-200">
    <FiImage className="h-12 w-12 text-neutral-400" aria-hidden />
    <span className="sr-only">Sem imagem</span>
  </div>
);

export function ProductImage({
  src,
  alt,
  fill = true,
  className = "object-cover",
  sizes,
  priority,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <Placeholder />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
}
