interface BattleComponentProps {
    battleId: number;
    started: boolean;
    joined: boolean;
    setBattleIdValue: (value: number) => void;
  }

  const BattleComponent: React.FC<BattleComponentProps> = ({ battleId, started, joined, setBattleIdValue }) => {

    const handleClick = () => {
      setBattleIdValue(battleId);
    };

    const getStatus = () => {
      if (started) {
          return { status: 'started', color: 'green' };
      } else if (joined) {
          return { status: 'joined', color: 'orange' };
      } else {
          return { status: 'created', color: 'blue' };
      }
  };
  
    return (
      <div>
        <p onClick={handleClick}>
            Battle with id: <span style={{ color: getStatus().color }}>{battleId}</span> 
            , status: <span style={{ color: getStatus().color }}>{getStatus().status}</span>
        </p>
      </div>
    );
  };

export default BattleComponent
