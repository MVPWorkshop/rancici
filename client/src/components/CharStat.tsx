const CharStat = ({stat}) => {
    const className = `cell ${stat.charBlock}`;
  return (
    <div className="char-stat">
    <div className={className}></div>
      <p>Armor: <strong>{stat.armor}</strong></p>
      <p>Health: <strong>{stat.health}</strong></p>
      <p>Attack: <strong>{stat.attack}</strong></p>
    </div>
  )
}

export default CharStat
