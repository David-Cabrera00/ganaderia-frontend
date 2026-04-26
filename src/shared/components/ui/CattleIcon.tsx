import type { SVGProps } from 'react';
import { FaCow } from 'react-icons/fa6';

export function CattleIcon(props: SVGProps<SVGSVGElement>) {
  const { width, height, className, style, ...rest } = props;

  const size =
    typeof width === 'number'
      ? width
      : typeof height === 'number'
      ? height
      : 18;

  return (
    <FaCow
      size={size}
      className={className}
      style={style}
      {...rest}
    />
  );
}

export default CattleIcon;