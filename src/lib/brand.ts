// Single source for the QR Anvil mark. Every icon, logo, and share image
// renders MARK_PATH. Change the shape here and run `npm run icons`.

export const BRAND_ORANGE = "#C45B28";
export const MARK_VIEWBOX = "0 0 64 64";

// Short line under the wordmark in the header lockup.
export const BRAND_TAGLINE = "Made for every scan.";

// "Cleft Corner": a solid tile in the SetupForge family shape (top-left
// corner rounded, radius 18 on a 64 grid) with the bottom-right corner cut
// off by one straight strike. Three QR finder patterns and two modules
// stepping toward the cut are holes (fill-rule evenodd). Reads at 16 px.
export const MARK_PATH = [
  // tile silhouette
  "M20 2H62V38L38 62H2V20A18 18 0 0 1 20 2Z",
  // finder top-left: ring + centre module
  "M10 10H26V26H10Z",
  "M15 15H21V21H15Z",
  // finder top-right
  "M38 10H54V26H38Z",
  "M43 15H49V21H43Z",
  // finder bottom-left
  "M10 38H26V54H10Z",
  "M15 43H21V49H15Z",
  // two modules toward the cut corner
  "M32 32H38V38H32Z",
  "M40 40H46V46H40Z",
].join(" ");
