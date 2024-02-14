import { Block, SHAPES } from '../types';
import { EventEmitter } from "events";

interface Props {
    avaliableBlocks: Block[];
}

export const chosenBlockEmitter = new EventEmitter();

function AvailableBlocks({ avaliableBlocks }: Props) {
    const handleClick = (blockId: number, blockShape: Block) => {
        chosenBlockEmitter.emit('blockSelected', { blockId, blockShape });
      };
  return (
    <div className="upcoming">
      {avaliableBlocks.map((block, blockIndex) => {
        const shape = SHAPES[block].shape.filter((row) =>
          row.some((cell) => cell)
        );
        return (
          <div key={blockIndex} onClick={() => handleClick(blockIndex, block)}>
            {shape.map((row, rowIndex) => {
              return (
                <div key={rowIndex} className="row">
                  {row.map((isSet, cellIndex) => {
                    const cellClass = isSet ? block : 'hidden';
                    return (
                      <div
                        key={`${blockIndex}-${rowIndex}-${cellIndex}`}
                        className={`cell ${cellClass}`}
                      ></div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default AvailableBlocks;