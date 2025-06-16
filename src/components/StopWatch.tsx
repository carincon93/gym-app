import { useEffect, useState } from "react";
import { showStopWatch } from "@/stores/gymStore";
import { useStore } from "@nanostores/react";
import { Play, Square } from "lucide-react";

export const StopWatch = () => {
  const [elapsedTime, setElapsedTime] = useState<number>(180);

  const $showStopWatchValue = useStore(showStopWatch);

  useEffect(() => {
    if (!$showStopWatchValue) return;

    const updateElapsedTime = () => {
      setElapsedTime((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          showStopWatch.set(false);
          return 0;
        }
        return newTime;
      });
    };

    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [$showStopWatchValue]);

  useEffect(() => {
    if (elapsedTime === 0) {
      showStopWatch.set(false);
      setElapsedTime(180);
    }
  }, [elapsedTime]);

  return (
    <div className="border shadow rounded">
      <div className="flex items-center justify-center">
        <div className="flex items-center">
          <button
            onClick={() => setElapsedTime(elapsedTime - 10)}
            className="h-9 w-9 shadow rounded flex items-center justify-center"
          >
            -
          </button>
          <small className="mx-3 min-w-[3ch] text-center">{elapsedTime}s</small>
          <button
            onClick={() => setElapsedTime(elapsedTime + 10)}
            className="h-9 w-9 shadow rounded flex items-center justify-center"
          >
            +
          </button>
        </div>
        <button
          onClick={() => showStopWatch.set(!$showStopWatchValue)}
          className="bg-black h-9 w-9 flex items-center justify-center text-white rounded"
        >
          {$showStopWatchValue ? <Square size={14} /> : <Play size={14} />}
        </button>
      </div>
    </div>
  );
};
