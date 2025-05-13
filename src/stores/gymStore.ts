import type { Week } from "@/lib/types";
import { getWeek } from "@/services/week.service";
import { atom, map } from "nanostores";

const checkIfWeekSelected = async (): Promise<Week | undefined> => {
  return getWeek().then();
};

 const showStopWatch = atom<boolean>(false);

 export  { checkIfWeekSelected, showStopWatch };
