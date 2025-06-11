export type Record = {
  id: number;
  reps: number;
  rest: number;
  weight: number;
  machineId: number;
};

export type Machine = {
  id: number;
  name: string;
  startingResistance: number;
  seatingLevel: string;
  image: string;
};

export type MaxGymTime = {
  id: number;
  startTime: number;
  maxTime: number;
};

export type Week = {
  id: number;
  firstDayOfWeek:number;
  lastDayOfWeek:number;
};

export type Treadmill = {
  id: number;
  inclineRange: number;
  speed: number;
  time: number;
};

export type Climbmill = {
  id: number;
  stairs: number;
  speed: number;
  time: number;
};
