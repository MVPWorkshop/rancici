import { useEffect, useState } from "react";

const countdown = { miliseconds: 0, seconds: 0, minutes: 2 };

const Countdown = ({ stateManager }) => {
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);
  const [miliseconds, setMiliseconds] = useState(0);

  useEffect(() => {
    const msStep = 100;

    const fcn = () => {
      if (countdown.miliseconds - msStep <= 0) {
        countdown.miliseconds = 1000 - msStep;
        if (countdown.seconds == 0) {
          countdown.seconds = 59;
          countdown.minutes -= 1;
        } else {
          countdown.seconds -= 1;
        }
      } else {
        countdown.miliseconds -= msStep;
        countdown.miliseconds = Math.max(countdown.miliseconds, 0);
      }

      if (countdown.minutes < 0) return;

      setMinutes(countdown.minutes);
      setSeconds(countdown.seconds);
      setMiliseconds(countdown.miliseconds);
    };

    setInterval(fcn, msStep);
  }, []);

  return (
    <div className="Countdown">
      <div className="Minutes">{"0" + minutes}</div>

      <div className="Separator">:</div>

      <div className="Seconds">{seconds}</div>

      <div className="Separator">:</div>

      <div className="Miliseconds">{"0." + miliseconds / 100}</div>
    </div>
  );
};

export default Countdown;
