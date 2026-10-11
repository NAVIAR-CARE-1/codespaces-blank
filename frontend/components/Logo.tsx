import Image from 'next/image';

export function Logo({ width, className = '' }: { width: number; className?: string }) {
  return (
    <Image
      src="/naviar-consult-logo.svg"
      alt="NAVIAR Consult"
      width={width}
      height={Math.round((width * 309) / 1356)}
      className={className}
      unoptimized
      priority
    />
  );
}
