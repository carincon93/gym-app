import { useEffect, useRef, useState } from "react";
import * as rive from "@rive-app/canvas";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import Treadmill from "@/components/icons/Treadmill";
import Climbmill from "@/components/icons/Climbmill";

import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  absMachineIds,
  adductorsMachineIds,
  bicepsMachineIds,
  calvesMachineIds,
  chestMachineIds,
  forearmsMachineIds,
  glutesMachineIds,
  hamstringsMachineIds,
  hipsMachineIds,
  latsMachineIds,
  lowerBackMachineIds,
  machines,
  neckMachineIds,
  obliquesMachineIds,
  quadsMachineIds,
  shouldersMachineIds,
  trapsMachineIds,
  tricepsMachineIds,
} from "@/data/data";
import {
  addRecord,
  getRecords,
  deleteRecord,
  updateRecord,
  getRecordsByMachine,
} from "@/services/records.service";
import type { Machine, MaxGymTime, Record, Week } from "@/lib/types";
import { showStopWatch } from "@/stores/gymStore";
import Loading from "./Loader";
import { addWeek, getWeek } from "@/services/week.service";
import { Calendar, ClockArrowDown } from "lucide-react";
import { addMaxGymTime, getMaxGymTime } from "@/services/maxtime.service";
import FullBodyCanvas from "./WeeklySummary";
import { deleteDB } from "@/services/connection.service";
import { toast } from "sonner";
import ClimbmillDialog from "./ClimbmillDialog";
import TreadmillDialog from "./TreadmillDialog";

type BodyCanvasProps = {};

export default function BodyCanvas({}: BodyCanvasProps) {
  const riveRef = useRef<rive.Rive | null>(null);
  const [muscleSelected, setMuscleSelected] = useState<string>("");
  const [machineSelected, setMachineSelected] = useState<Machine>();
  const [openMachineDialog, setOpenMachineDialog] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [weekRecords, setWeekRecords] = useState<Record[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week>();
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [openSummaryDialog, setOpenSummaryDialog] = useState<boolean>(false);
  const [openResetDialog, setOpenResetDialog] = useState<boolean>(false);
  const [openClimbmillDialog, setOpenClimbmillDialog] =
    useState<boolean>(false);
  const [openTreadmillDialog, setOpenTreadmillDialog] =
    useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<Record>();
  const [loading, setLoading] = useState<boolean>(false);
  const [daySelected, setDaySelected] = useState<string | undefined>("");
  const [maxGymTime, setMaxGymTime] = useState<MaxGymTime>();
  const [elapsedTime, setElapsedTime] = useState<string>("");

  // Función para crear instancias de animaciones Rive
  const createRiveInstance = (artboard: string) => {
    setLoading(true);

    setDaySelected(artboard.split(" ").at(-1));

    const canvasElement: HTMLCanvasElement | null = document.getElementById(
      "full-body-canvas"
    ) as HTMLCanvasElement | null;

    if (!canvasElement) {
      console.error(`Canvas with id full-body-canvas not found.`);
      return;
    }

    try {
      const riveInstance = new rive.Rive({
        canvas: canvasElement,
        autoplay: true,
        stateMachines: "State Machine 1",
        src: "/gym-app/animations/upper-lower.riv",
        artboard: artboard,
        autoBind: true,
        layout: new rive.Layout({
          alignment: rive.Alignment.BottomCenter,
        }),

        onStateChange: (e) => {
          const name = Array.isArray(e?.data) ? e.data[0] : "";
          if (name.includes("Initial") || name.includes("Timeline")) return;

          setMuscleSelected(name);
          setOpenDrawer(true);
        },

        onLoad: () => {
          setLoading(false);

          // The Rive object is now loaded and ready to use.
          const vmi = riveInstance.viewModelInstance;

          const setStringProperty = (propertyName: string, value: string) => {
            const property = vmi?.string(propertyName);
            if (property) {
              property.value = value;
            }
          };

          const mrv = (machineIds: string[]) =>
            weekRecords.filter((weekRecord) =>
              machineIds.includes(weekRecord.machineId.toString())
            );

          const chest = mrv(chestMachineIds);
          const quads = mrv(quadsMachineIds);
          const abs = mrv(absMachineIds);
          const obliques = mrv(obliquesMachineIds);
          const biceps = mrv(bicepsMachineIds);
          const shoulders = mrv(shouldersMachineIds);
          const forearms = mrv(forearmsMachineIds);
          const adductors = mrv(adductorsMachineIds);
          const calves = mrv(calvesMachineIds);
          const traps = mrv(trapsMachineIds);
          const neck = mrv(neckMachineIds);
          const hips = mrv(hipsMachineIds);
          const hamstrings = mrv(hamstringsMachineIds);
          const glutes = mrv(glutesMachineIds);
          const lats = mrv(latsMachineIds);
          const triceps = mrv(tricepsMachineIds);
          const lowerBack = mrv(lowerBackMachineIds);

          const muscleMap = {
            bicepsTxt: biceps,
            trapsTxt: traps,
            hipsTxt: hips,
            adductorsTxt: adductors,
            calvesTxt: calves,
            quadsTxt: quads,
            neckTxt: neck,
            shouldersTxt: shoulders,
            chestTxt: chest,
            obliquesTxt: obliques,
            absTxt: abs,
            forearmsTxt: forearms,
            hamstringsTxt: hamstrings,
            glutesTxt: glutes,
            lowerBackTxt: lowerBack,
            tricepsTxt: triceps,
            latsTxt: lats,
          };

          Object.entries(muscleMap).forEach(([property, muscle]) => {
            setStringProperty(property, muscle.length.toString());
          });
        },
      });

      riveRef.current = riveInstance;
    } catch (error) {
      console.error(
        `Error initializing Rive animation for full-body-canvas:`,
        error
      );
    }
  };

  const initRiveInstance = () => {
    const today = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Bogota" })
    ).toLocaleDateString("en-US", { weekday: "short" });

    if (today === "Mon") {
      createRiveInstance(`Upper A - Monday`);
    } else if (today === "Tue") {
      createRiveInstance(`Upper A - Tuesday`);
    } else if (today === "Wed") {
      createRiveInstance(`Lower A - Wednesday`);
    } else if (today === "Fri") {
      createRiveInstance(`Upper B - Friday`);
    } else if (today === "Sat") {
      createRiveInstance(`Upper B - Saturday`);
    } else if (today === "Sun") {
      createRiveInstance(`Lower B - Sunday`);
    }
  };

  const fireCloseDrawer = () => {
    setMuscleSelected("");

    const riveInstance = riveRef.current;
    if (!riveInstance) return;

    const inputs = riveInstance.stateMachineInputs("State Machine 1");
    const CloseDrawerInput = inputs?.find(
      (input) => input.name === "CloseDrawer"
    );

    if (CloseDrawerInput && CloseDrawerInput?.type.toString() === "58") {
      CloseDrawerInput.fire();
    }
  };

  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const handleMachineSelected = (machine: Machine) => {
    setMachineSelected(machine);
    getRecordsByMachine(machine).then(setRecords);
    setOpenMachineDialog(true);
  };

  const handleAddFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const record: Record = {
      id: Date.now(),
      reps: Number(formData.get("reps")),
      rest: 180,
      weight: Number(formData.get("weight")),
      machineId: machineSelected?.id || 0,
    };

    handleAddRecord(record);
    showStopWatch.set(true);
  };

  const handleUpdateFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const record: Record = {
      id: selectedRecord?.id || Date.now(),
      reps: Number(formData.get("reps")),
      rest: 180,
      weight: Number(formData.get("weight")),
      machineId: selectedRecord?.machineId || 0,
    };

    handleUpdateRecord(record);
    setOpenUpdateDialog(false);
  };

  const handleSelectedRecord = (record: Record) => {
    setSelectedRecord(record);
    setOpenUpdateDialog(true);
  };

  const handleAddRecord = async (newRecord: Record) => {
    if (!newRecord.machineId) return;

    await addRecord(newRecord);
    setRecords([...records, newRecord]);
    setWeekRecords([...weekRecords, newRecord]);
  };

  const handleUpdateRecord = async (newRecord: Record) => {
    if (!newRecord.machineId) return;

    await updateRecord(newRecord);
    setRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.id === newRecord.id ? { ...record, ...newRecord } : record
      )
    );
  };

  const handleDeleteRecord = async (record: Record) => {
    const newRecords = records.filter(
      (oldRecord) => oldRecord.id !== record.id
    );
    setRecords(newRecords);
    setWeekRecords(newRecords);

    await deleteRecord(record);
    setOpenUpdateDialog(false);
    setSelectedRecord(undefined);
  };

  const handleWeek = async () => {
    const currentWeekDb = await getWeek();

    await addWeek(currentWeekDb).then(setSelectedWeek);
  };

  const handleAddMaxTime = async () => {
    await addMaxGymTime().then(setMaxGymTime);
  };

  const handleRemoveDb = async () => {
    await deleteDB();
    getWeek().then(setSelectedWeek);
    getMaxGymTime().then(setMaxGymTime);

    toast("DB deleted.");
  };

  useEffect(() => {
    if (!openDrawer) {
      setOpenDrawer(false);
      fireCloseDrawer();
    }
  }, [openDrawer]);

  useEffect(() => {
    if (!maxGymTime) return;

    console.log(maxGymTime);

    const updateElapsedTime = () => {
      const elapsed = maxGymTime.maxTime - Date.now();
      if (elapsed <= 0) {
        setElapsedTime("");
        return;
      }
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      setElapsedTime(
        `${hours.toString().padStart(2, "0")} hr ${minutes
          .toString()
          .padStart(2, "0")} min`
      );
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [maxGymTime]);

  useEffect(() => {
    if (!selectedWeek) return;

    initRiveInstance();
    getMaxGymTime().then(setMaxGymTime);

    getRecords().then((records) => {
      setWeekRecords(
        records.filter(
          (record) =>
            record.id > selectedWeek?.firstDayOfWeek &&
            record.id < selectedWeek?.lastDayOfWeek
        )
      );
    });
  }, [selectedWeek]);

  useEffect(() => {
    if (weekRecords.length === 0) return;

    initRiveInstance();
  }, [weekRecords]);

  useEffect(() => {
    handleWeek();
  }, []);

  return (
    <div>
      <Drawer
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        repositionInputs={false}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select a machine or an exercise:</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <ul className="h-[250px] overflow-y-scroll space-y-2">
              {Object.entries(machines)
                .filter(([key]) =>
                  muscleSelected.toLowerCase().includes(key.toLowerCase())
                )
                .flatMap(([key, machineList]) =>
                  machineList.map((machine: Machine) => (
                    <li
                      key={machine.id}
                      className="rounded-md p-2 border flex items-center space-x-4"
                      onClick={() => handleMachineSelected(machine)}
                    >
                      <img
                        src={machine.image}
                        alt={`Machine ${machine.id}`}
                        className="bg-slate-100 rounded-md size-20 object-contain"
                      />
                      <h6>{machine.name}</h6>
                    </li>
                  ))
                )}
            </ul>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={openMachineDialog} onOpenChange={setOpenMachineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle asChild>
              <div className="rounded-md p-2 border mt-4 mb-6 relative">
                <div className="flex items-center justify-between space-x-4">
                  <img
                    src={machineSelected?.image}
                    alt={`Machine ${machineSelected?.id}`}
                    className="bg-slate-100 rounded-md size-16 object-contain"
                  />
                  <h6>{machineSelected?.name}</h6>

                  <div>
                    {machineSelected?.seatingLevel ? (
                      <small className="text-[10px] block">
                        Seating level: {machineSelected.seatingLevel}
                      </small>
                    ) : (
                      <></>
                    )}

                    {machineSelected?.startingResistance ? (
                      <small className="text-[10px] block">
                        Starting resistance:{" "}
                        {machineSelected.startingResistance} (Kg)
                      </small>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {records.slice(-10).every((record) => record.reps >= 12) &&
                  records.length >= 10 && (
                    <div className="flex items-center justify-center mb-4">
                      <small className="py-1 px-2 bg-red-500 text-white rounded-md">
                        Time to increase weight
                      </small>
                    </div>
                  )}
                <div className="relative">
                  <small
                    className={`absolute left-0 bottom-0 text-[10px] ${
                      records.length === 0 && "hidden"
                    }`}
                  >
                    Reps
                  </small>
                  <div className="flex space-x-1 items-end justify-center">
                    {records.slice(-10).map((record) => (
                      <div
                        key={`rep-${record.id}`}
                        onClick={() => handleSelectedRecord(record)}
                      >
                        <div
                          className={`w-4 bg-green-400 flex justify-center`}
                          style={{ height: record.reps + "px" }}
                        />
                        <small className="block text-center text-[8px]">
                          {record.reps}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative mt-4">
                  <small
                    className={`absolute left-0 bottom-0 text-[10px] ${
                      records.length === 0 && "hidden"
                    }`}
                  >
                    Weight (Kg)
                  </small>
                  <div className="flex space-x-1 items-end justify-center">
                    {records.slice(-10).map((record) => (
                      <div
                        key={`weight-${record.id}`}
                        onClick={() => handleSelectedRecord(record)}
                      >
                        <div
                          className={`w-4 bg-amber-400 flex justify-center select-none`}
                          style={{ height: record.weight / 1.5 + "px" }}
                        />
                        <small className="block text-center text-[8px]">
                          {record.weight}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative mt-4">
                  <small
                    className={`absolute left-0 bottom-0 text-[10px] ${
                      records.length === 0 && "hidden"
                    }`}
                  >
                    Date
                  </small>
                  <div className="flex items-end justify-center">
                    {records.slice(-10).map((record) => (
                      <div
                        key={`weight-${record.id}`}
                        onClick={() => handleSelectedRecord(record)}
                        style={{ margin: "0 2px" }}
                      >
                        <div className={`flex justify-center select-none`} />
                        <small className="block text-center text-[8px] -rotate-90 w-[16px]">
                          {record.id
                            ? new Date(record.id).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                              })
                            : ""}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <form
            id="machine-form"
            className="space-x-2 grid grid-cols-2"
            autoFocus={false}
            onSubmit={handleAddFormSubmit}
          >
            <fieldset>
              <Label className="my-2 text-xs" htmlFor="reps">
                Reps *
              </Label>
              <Input
                name="reps"
                id="reps"
                type="number"
                min="0"
                autoComplete="off"
                required
              />
            </fieldset>

            <fieldset>
              <Label className="my-2 text-xs" htmlFor="weight">
                Weight (Kg) *
              </Label>
              <Input
                name="weight"
                id="weight"
                type="number"
                min="0"
                step="0.1"
                autoComplete="off"
                required
              />
            </fieldset>
          </form>
          <DialogFooter>
            <div className="flex justify-between items-center w-full">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>

              <Button
                type="submit"
                form="machine-form"
                disabled={!selectedWeek?.lastDayOfWeek}
              >
                Save and rest
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle asChild>
              <div className="rounded-md p-2 border mt-4 mb-6 relative">
                Modify record
              </div>
            </DialogTitle>
            <DialogDescription asChild></DialogDescription>
          </DialogHeader>
          <form
            id="update-form"
            className="space-x-2 grid grid-cols-2"
            onSubmit={handleUpdateFormSubmit}
          >
            <fieldset>
              <Label className="my-2 text-xs" htmlFor="reps">
                Reps *
              </Label>
              <Input
                name="reps"
                id="reps"
                type="number"
                min="0"
                autoComplete="off"
                disabled={!selectedWeek?.lastDayOfWeek}
                required
              />
            </fieldset>

            <fieldset>
              <Label className="my-2 text-xs" htmlFor="weight">
                Weight (Kg) *
              </Label>
              <Input
                name="weight"
                id="weight"
                type="number"
                min="0"
                step="0.1"
                autoComplete="off"
                disabled={!selectedWeek?.lastDayOfWeek}
                required
              />
            </fieldset>
          </form>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={() =>
                selectedRecord && handleDeleteRecord(selectedRecord)
              }
            >
              Delete
            </Button>

            <Button
              type="submit"
              form="update-form"
              disabled={!selectedWeek?.lastDayOfWeek}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col justify-between items-center min-h-[100svh]">
        <div className="grid grid-cols-6 w-full mb-4">
          <Button
            onClick={() => createRiveInstance("Upper A - Monday")}
            className={`text-xs w-full ${
              daySelected === "Monday" ? "bg-slate-200" : "bg-slate-100"
            } rounded-none text-black uppercase hover:bg-slate-300`}
            // disabled={daySelected !== "Monday"}
          >
            Mon
          </Button>

          <Button
            onClick={() => createRiveInstance("Upper A - Tuesday")}
            className={`text-xs w-full ${
              daySelected === "Tuesday" ? "bg-slate-200" : "bg-slate-100"
            } rounded-none text-black uppercase hover:bg-slate-300`}
            // disabled={daySelected !== "Tuesday"}
          >
            Tue
          </Button>

          <Button
            onClick={() => createRiveInstance("Lower A - Wednesday")}
            className={`text-xs w-full ${
              daySelected === "Wednesday" ? "bg-slate-200" : "bg-slate-100"
            } rounded-none text-black uppercase hover:bg-slate-300`}
            // disabled={daySelected !== "Wednesday"}
          >
            Wed
          </Button>

          <Button
            onClick={() => createRiveInstance("Upper B - Friday")}
            className={`text-xs w-full ${
              daySelected === "Friday" ? "bg-slate-200" : "bg-slate-100"
            } rounded-none text-black uppercase hover:bg-slate-300`}
            // disabled={daySelected !== "Friday"}
          >
            Fri
          </Button>

          <Button
            onClick={() => createRiveInstance("Upper B - Saturday")}
            className={`text-xs w-full ${
              daySelected === "Saturday" ? "bg-slate-200" : "bg-slate-100"
            } rounded-none text-black uppercase hover:bg-slate-300`}
            // disabled={daySelected !== "Saturday"}
          >
            Sat
          </Button>

          <Button
            onClick={() => createRiveInstance("Lower B - Sunday")}
            className={`text-xs w-full ${
              daySelected === "Sunday" ? "bg-slate-200" : "bg-slate-100"
            } rounded-none text-black uppercase hover:bg-slate-300`}
            // disabled={daySelected !== "Sunday"}
          >
            Sun
          </Button>
        </div>
        {loading && (
          <Loading className="text-violet-900 dark:text-white absolute inset-0 z-50 h-[100svh] flex items-center justify-center" />
        )}
        <FullBodyCanvas
          openSummaryDialog={openSummaryDialog}
          setOpenSummaryDialog={setOpenSummaryDialog}
        />
        <canvas
          id="full-body-canvas"
          className="translate-y-6"
          width={390}
          height={360}
        />
        <div className="flex-1 size-full flex flex-col items-center justify-center space-y-5">
          {selectedWeek && (
            <>
              <div className="flex items-center bg-white rounded-md shadow p-2">
                <strong className="mr-2 flex items-center gap-1">
                  <Calendar />
                  Week:
                </strong>
                {formatDate(selectedWeek?.firstDayOfWeek)} -{" "}
                {formatDate(selectedWeek?.lastDayOfWeek)}
              </div>

              {elapsedTime ? (
                <span className="flex gap-2 bg-white rounded-md shadow p-2">
                  <ClockArrowDown />
                  {elapsedTime}
                </span>
              ) : (
                <Button
                  onClick={handleAddMaxTime}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Start session
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <AlertDialog open={openResetDialog} onOpenChange={setOpenResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              data from local database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDb}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClimbmillDialog
        openClimbmillDialog={openClimbmillDialog}
        setOpenClimbmillDialog={setOpenClimbmillDialog}
      />

      <TreadmillDialog
        openTreadmillDialog={openTreadmillDialog}
        setOpenTreadmillDialog={setOpenTreadmillDialog}
      />

      <div className="absolute bottom-4 left-0 right-0 px-2 w-full flex justify-between items-center">
        <Button variant="destructive" onClick={() => setOpenResetDialog(true)}>
          Reset
        </Button>

        <Button onClick={() => setOpenTreadmillDialog(true)}>
          <Treadmill />
        </Button>

        <Button onClick={() => setOpenClimbmillDialog(true)}>
          <Climbmill />
        </Button>

        <Button onClick={() => setOpenSummaryDialog(true)}>
          Workout summary
        </Button>
      </div>
    </div>
  );
}
