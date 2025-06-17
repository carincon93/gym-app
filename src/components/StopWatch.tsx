import { useEffect, useState } from "react";
import { Play } from "lucide-react";

export const StopWatch = () => {
  const [elapsedTime, setElapsedTime] = useState<number>(180);
  const [isResting, setIsResting] = useState<boolean>(false);

  const initStopWatch = () => {
    setIsResting(true);
    const endTime = localStorage.getItem("stopWatchEndTime");
    if (!endTime) {
      const targetTime = Date.now() + elapsedTime * 1000;
      localStorage.setItem("stopWatchEndTime", targetTime.toString());
    }

    const updateElapsedTime = () => {
      const currentEndTime = localStorage.getItem("stopWatchEndTime");
      if (!currentEndTime) return;

      const remainingMs = parseInt(currentEndTime) - Date.now();
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      if (remainingSeconds <= 0) {
        localStorage.removeItem("stopWatchEndTime");
        setElapsedTime(0);
        setIsResting(false);
        return;
      }

      setElapsedTime(remainingSeconds);
    };

    const interval = setInterval(updateElapsedTime, 1000);
    updateElapsedTime(); // Initial call

    return () => clearInterval(interval);
  };

  useEffect(() => {
    const startTime = localStorage.getItem("stopWatchEndTime");

    if (startTime) {
      initStopWatch();
    }
  }, []);

  return (
    <div className="border shadow rounded">
      <div className="flex items-center justify-center">
        <div className="flex items-center">
          <button
            onClick={() => setElapsedTime(elapsedTime - 10)}
            className={`h-9 w-9 shadow rounded flex items-center justify-center ${
              isResting && "opacity-50"
            }`}
            disabled={isResting}
          >
            -
          </button>
          <small className="mx-3 min-w-[3ch] text-center">{elapsedTime}s</small>
          <button
            onClick={() => setElapsedTime(elapsedTime + 10)}
            className={`h-9 w-9 shadow rounded flex items-center justify-center ${
              isResting && "opacity-50"
            }`}
            disabled={isResting}
          >
            +
          </button>
        </div>
        <button
          onClick={() => initStopWatch()}
          className={`bg-black h-9 w-9 flex items-center justify-center text-white rounded ${
            isResting && "opacity-50"
          }`}
          disabled={isResting}
        >
          <Play size={14} />
          {""}
        </button>
      </div>
    </div>
  );
};
