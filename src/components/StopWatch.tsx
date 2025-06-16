import { useEffect, useState } from "react";
import { showStopWatch } from "@/stores/gymStore";
import { useStore } from "@nanostores/react";
import { Button } from "./ui/button";
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

  return (
    <div className="border shadow rounded">
      <div className="flex items-center justify-center">
        <div>
            <button
              onClick={() => setElapsedTime(elapsedTime - 10)}
              className="p-2 shadow"
            >
              -
            </button>
            <small className="mx-1.5">{elapsedTime}s</small>
            <button
              onClick={() => setElapsedTime(elapsedTime + 10)}
              className="p-2 shadow"
            >
              +
            </button>
        </div>
        <button
          onClick={() => showStopWatch.set(!$showStopWatchValue)}
          className="bg-black p-2 block text-white rounded"
        >
          {$showStopWatchValue ? <Square size={14} /> : <Play size={14} />}
        </button>
      </div>
    </div>
  );
};
