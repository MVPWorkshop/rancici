import { CellOptions, Block } from "../types";

interface Props {
  type: CellOptions;
  isCollided: boolean;
  playerId?: number;
}

function Cell({ type, isCollided, playerId }: Props) {
  const className = `cell ${isCollided ? "collision" : type}`;
  const isChar = [
    Block.Char1,
    Block.Char2,
    Block.Char3,
    Block.Char4,
    Block.Char5,
  ].includes(type as any);

  if (isChar == false) return <div className={className} />;

  const chId = type.replace("Char", "");

  return (
    <div className={className}>
      <img
        id={`P-${playerId}-Ch-${chId}`}
        className={className}
        src={`./characters/ch${chId}.png`}
      />
    </div>
  );
}

export default Cell;
