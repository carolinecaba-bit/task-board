const PALETTE = [
  { bg: "#e3eafb", fg: "#3457a6" },
  { bg: "#faedd9", fg: "#a56a1d" },
  { bg: "#e2f2e6", fg: "#2f7d4f" },
  { bg: "#f8e4df", fg: "#b3432e" },
  { bg: "#efe4fb", fg: "#6d3aa6" },
  { bg: "#ddf3f3", fg: "#1c7d7d" },
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  size = 24,
}: {
  name: string;
  size?: number;
}) {
  const colors = PALETTE[hashName(name) % PALETTE.length];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-medium shrink-0"
      style={{
        width: size,
        height: size,
        background: colors.bg,
        color: colors.fg,
        fontSize: size * 0.4,
      }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
