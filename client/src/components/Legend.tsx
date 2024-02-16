const Legend = () => {
  return (
    <div className="legend">
      <div className="legend-row">
      <div className="green-pic"></div>
        <div className="legend-text">+30 health</div>
      </div>
      <div className="legend-row">
      <div className="red-pic"></div>
        <div className="legend-text">+20 attack</div>
      </div>
      <div className="legend-row">
        <div className="blue-pic"></div>
        <div className="legend-text">+15 armor</div>
      </div>
    </div>
  )
}

export default Legend
