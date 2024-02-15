const CharStat = ({ stat }) => {
  const chIdx = stat.charBlock.replace("Char", "");

  return (
    <div className="char-stat">
      <img className="char-stat-img" src={`/characters/ch${chIdx}.png`}></img>
      <p>
        Armor: <strong>{stat.armor}</strong>
      </p>
      <p>
        Health: <strong>{stat.health}</strong>
      </p>
      <p>
        Attack: <strong>{stat.attack}</strong>
      </p>
    </div>
  );
};

export default CharStat;
