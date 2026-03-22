"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";
import { ProductImage } from "@/app/components/ProductImage";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
  aspectRatio?: "4/3" | "16/10" | "1/1";
}

export function ImageCarousel({
  images,
  alt,
  className = "",
  imageClassName = "object-cover",
  aspectRatio = "16/10",
}: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: false,
  });

  const goNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const goPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const selectedIndex = useEmblaCarouselSelectedIndex(emblaApi);

  const aspectClass = {
    "4/3": "aspect-[4/3]",
    "16/10": "aspect-[16/10]",
    "1/1": "aspect-square",
  }[aspectRatio];

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center overflow-hidden bg-neutral-200 ${aspectClass} ${className}`}>
        <FiImage className="h-16 w-16 text-neutral-400" aria-hidden />
        <span className="sr-only">Sem imagem</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden bg-neutral-100 ${aspectClass} ${className}`}>
        <ProductImage
          src={images[0]}
          alt={alt}
          className={imageClassName}
          sizes="(max-width: 640px) 100vw, 512px"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
      <div className={`relative overflow-hidden ${aspectClass}`} ref={emblaRef}>
        <div className="flex h-full">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              <ProductImage
                src={src}
                alt={`${alt} - imagem ${i + 1}`}
                className={imageClassName}
                sizes="(max-width: 640px) 100vw, 512px"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={goPrev}
        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm transition-colors hover:bg-white hover:text-neutral-800"
        aria-label="Imagem anterior"
      >
        <FiChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={goNext}
        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm transition-colors hover:bg-white hover:text-neutral-800"
        aria-label="Próxima imagem"
      >
        <FiChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {images.map((src, i) => (
          <button
            key={`dot-${src}-${i}`}
            type="button"
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === selectedIndex ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Ir para imagem ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function useEmblaCarouselSelectedIndex(emblaApi: ReturnType<typeof useEmblaCarousel>[1]) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return selectedIndex;
}
