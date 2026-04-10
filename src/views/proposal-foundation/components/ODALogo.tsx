import Image from "next/image";

import { sv } from "../shared";

export function ODALogo({
  size = "md",
}: {
  color?: string;
  size?: "sm" | "md" | "lg";
}) {
  // sm: nav bar, md: email card, lg: footer/reviews — logo is 1:1 (square placeholder)
  const dims = { sm: [125, 100], md: [125, 100], lg: [150, 120] };
  const [width, height] = dims[size];

  return (
    <Image
      src="/assets/bosterra-logo.png"
      alt="Bosterra, Inc."
      width={width}
      height={height}
      priority={size !== "lg"}
      style={{ width: sv(width), height: sv(height), objectFit: "contain" }}
    />
  );
}
