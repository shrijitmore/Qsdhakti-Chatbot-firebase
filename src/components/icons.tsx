import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="11" cy="10" r="7" stroke="hsl(var(--primary))" strokeWidth="2"/>
      <line x1="16" y1="15" x2="20" y2="19" stroke="hsl(var(--primary))" strokeWidth="2"/>
      <rect x="7" y="10" width="2" height="4" fill="hsl(var(--accent))"/>
      <rect x="10" y="8" width="2" height="6" fill="hsl(var(--accent))"/>
      <rect x="13" y="11" width="2" height="3" fill="hsl(var(--accent))"/>
    </svg>
  );
}
