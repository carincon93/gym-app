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
  image: string;
};

export type MaxGymTime = {
  id: number;
  startTime: number;
  maxTime: Object;
};

export type Week = {
  id: number;
  firstDayOfWeek: Object;
  lastDayOfWeek: Object;
};
