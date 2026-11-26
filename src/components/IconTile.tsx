import React from "react";

export type TileHue =
  | "amber"
  | "emerald"
  | "sky"
  | "violet"
  | "rose"
  | "cyan"
  | "gold"
  | "pink"
  | "multi";

interface IconTileProps {
  hue?: TileHue;
  size?: number;
  className?: string;
  children: React.ReactNode;
}

export const IconTile: React.FC<IconTileProps> = ({
  hue = "sky",
  size = 42,
  className = "",
  children,
}) => {
  return (
    <span
      className={`tile-squircle t-${hue} ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
};
