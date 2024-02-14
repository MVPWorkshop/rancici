import CharStat from "./CharStat";

const CharStats = ({stats}) => {
  return (
    <div className="char-stats">
      {stats.map((stat, index) => (
        <CharStat key={index} stat={stat} />
      ))}
    </div>
  )
}

export default CharStats
