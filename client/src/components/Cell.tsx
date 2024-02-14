import { CellOptions } from '../types';

interface Props {
  type: CellOptions;
  isCollided: boolean
}

function Cell({ type, isCollided }: Props) {
  const className = `cell ${isCollided ? 'collision' : type}`;
  return <div className={className} />;
}

export default Cell;