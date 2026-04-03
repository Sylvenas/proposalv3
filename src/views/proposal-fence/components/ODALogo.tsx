import Image from "next/image";

import { sv } from "../shared";

export function ODALogo({
  size = "md",
}: {
  color?: string;
  size?: "sm" | "md" | "lg";
}) {
  // sm: nav bar, md: email card, lg: footer/reviews — logo is 5:4 (1250×1000)
  const dims = { sm: [125, 100], md: [125, 100], lg: [150, 120] };
  const [width, height] = dims[size];

  return (
    <Image
      src="/assets/grand-rapids-fence-logo.png"
      alt="Grand Rapids Fence"
      width={width}
      height={height}
      priority={size !== "lg"}
      style={{ width: sv(width), height: sv(height), objectFit: "contain" }}
    />
  );
}
