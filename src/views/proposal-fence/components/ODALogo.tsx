import Image from "next/image";

import { sv } from "../shared";

export function ODALogo({
  size = "md",
}: {
  color?: string;
  size?: "sm" | "md" | "lg";
}) {
  // sm: nav bar (109×30), md: email card (130×36), lg: footer/reviews (217×60)
  const dims = { sm: [109, 30], md: [130, 36], lg: [217, 60] };
  const [width, height] = dims[size];

  return (
    <Image
      src="/assets/madison-fence-logo.png"
      alt="Madison Fence Company"
      width={width}
      height={height}
      priority={size !== "lg"}
      style={{ width: sv(width), height: sv(height) }}
    />
  );
}
