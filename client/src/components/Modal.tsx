const Modal = ({ stateManager }) => {
  const modal = stateManager.state.modal;
  if (modal == null) {
    return;
  }

  return (
    <div className="Modal">
      <div className={`ModalContentWrapper ${modal.blinking ? " Blink" : ""}`}>
        {modal.special == "battle_starting" ? (
          <img className="BattleImgSymbol" src="sword.png"></img>
        ) : (
          <span className="loader"></span>
        )}

        <div className={`ModalContent`}>
          {modal.imgPath ? (
            <img className="ModalImg" src={modal.imgPath}></img>
          ) : null}
          <div className="Title">{modal.title}</div>
          <div className="Description">
            {modal.desc.map((desc) => (
              <div className="DescriptionField">{desc}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
