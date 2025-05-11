import { useEffect, useState } from "react";
import { showStopWatch } from "@/stores/stopWatchStore";
import { useStore } from "@nanostores/react";
import { Button } from "./ui/button";
import { Square } from "lucide-react";

export const StopWatch = () => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);

  const $showStopWatchValue = useStore(showStopWatch);

  useEffect(() => {
    if (!startTime) return;

    const updateElapsedTime = () => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000)); // In seconds
    };

    updateElapsedTime(); // Calculate when the page has loaded

    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if ($showStopWatchValue) {
      setStartTime(Date.now());
    } else {
      setElapsedTime(0);
      setStartTime(0);
    }
  }, [$showStopWatchValue]);

  useEffect(() => {
    if (elapsedTime >= 180) {
      setElapsedTime(0);
      setStartTime(0);
      showStopWatch.set(false);
    }
  }, [elapsedTime]);

  return (
    <div
      className={`fixed ${
        $showStopWatchValue ? "flex" : "hidden"
      } top-0 left-0 right-0 text-6xl text-center h-full w-full flex-col items-center justify-center bg-white mx-auto z-[9999]`}
    >
      {elapsedTime}s
    </div>
  );
};
