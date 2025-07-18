import { useEffect, useState } from "react";
import { Expand, Play } from "lucide-react";
import { showStopWatch } from "@/stores/gymStore";
import { useStore } from "@nanostores/react";

export const StopWatch = () => {
  const [elapsedTime, setElapsedTime] = useState<number>(200);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [expandStopWatch, setExpandStopWatch] = useState<boolean>(false);

  const $showStopWatchValue = useStore(showStopWatch);

  useEffect(() => {
    if (!$showStopWatchValue) return;

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
        setElapsedTime(200);
        setIsResting(false);
        showStopWatch.set(false);
        return;
      }

      setElapsedTime(remainingSeconds);
    };

    const interval = setInterval(updateElapsedTime, 1000);
    updateElapsedTime(); // Initial call

    return () => clearInterval(interval);
  }, [$showStopWatchValue]);

  useEffect(() => {
    const startTime = localStorage.getItem("stopWatchEndTime");

    if (startTime) {
      showStopWatch.set(true);
    }
  }, []);

  return (
    <>
      <div className="border shadow rounded">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <button
              onClick={() =>
                setElapsedTime(elapsedTime > 0 ? elapsedTime - 10 : 0)
              }
              className={`h-9 w-9 shadow rounded flex items-center justify-center ${
                isResting && "opacity-50"
              }`}
              disabled={isResting}
            >
              -
            </button>
            <small
              className="mx-3 min-w-[3ch] text-center select-none"
              onClick={() => setExpandStopWatch(true)}
            >
              {elapsedTime}s
            </small>
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
            onClick={() => showStopWatch.set(true)}
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

      {expandStopWatch && isResting && (
        <div className="bg-white absolute inset-0 w-full h-full z-10 top-0 rounded-md flex items-center justify-center text-6xl font-bold">
          {elapsedTime}s
        </div>
      )}
    </>
  );
};
