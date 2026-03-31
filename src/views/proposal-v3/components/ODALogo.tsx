import Image from "next/image";

import { sv } from "../shared";

export function ODALogo({
  src,
  alt,
  size = "md",
}: {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}) {
  // sm: nav bar (109×30), md: email card (130×36), lg: footer/reviews (217×60)
  const dims = { sm: [109, 30], md: [130, 36], lg: [217, 60] };
  const [width, height] = dims[size];

  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={width}
      height={height}
      priority={size !== "lg"}
      style={{ width: "auto", height: sv(height), objectFit: "contain" }}
    />
  );
}
