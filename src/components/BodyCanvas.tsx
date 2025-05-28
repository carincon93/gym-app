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

import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { machines } from "@/data/data";
import {
  addRecord,
  getRecords,
  deleteRecord,
  updateRecord,
} from "@/services/records.service";
import type { Machine, Record, Week } from "@/lib/types";
// import { Play } from "lucide-react";
import { showStopWatch, checkIfWeekSelected } from "@/stores/gymStore";

type BodyCanvasProps = {
  canvasId: string;
};

export default function BodyCanvas({ canvasId }: BodyCanvasProps) {
  const [muscleSelected, setMuscleSelected] = useState<string>("");
  const [machineSelected, setMachineSelected] = useState<Machine>();
  const [openMachineDialog, setOpenMachineDialog] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week>();
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<Record>();
  const riveRef = useRef<rive.Rive | null>(null);

  // Función para crear instancias de animaciones Rive
  const createRiveInstance = () => {
    const canvasElement: HTMLCanvasElement | null = document.getElementById(
      canvasId
    ) as HTMLCanvasElement | null;

    if (!canvasElement) {
      console.error(`Canvas with id "${canvasId}" not found.`);
      return;
    }

    try {
      const instance = new rive.Rive({
        canvas: canvasElement,
        autoplay: true,
        stateMachines: "State Machine 1",
        src:
          canvasId === "canvas-front-body"
            ? "/gym-app/animations/front-body.riv"
            : "/gym-app/animations/back-body.riv",
        onStateChange: (e) => {
          const name = Array.isArray(e?.data) ? e.data[0] : "";
          if (name.includes("Initial")) return;

          setMuscleSelected(name);

          if (!name.includes("Initial")) {
            setOpenDrawer(true);
          }
        },
      });

      riveRef.current = instance;
    } catch (error) {
      console.error(
        `Error initializing Rive animation for ${canvasId}:`,
        error
      );
    }
  };

  const triggerZoomOut = () => {
    const riveInstance = riveRef.current;
    if (!riveInstance) return;

    const inputs = riveInstance.stateMachineInputs("State Machine 1");
    const zoomOutInput = inputs.find((input) => input.name === "ClickZoomOut");

    if (zoomOutInput && zoomOutInput?.type.toString() === "58") {
      zoomOutInput.fire();
    }

    setMuscleSelected("");
  };

  const handleMachineSelected = (machine: Machine) => {
    setMachineSelected(machine);
    getRecords(machine).then(setRecords);
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

    await deleteRecord(record);
    setOpenUpdateDialog(false);
    setSelectedRecord(undefined);
  };

  useEffect(() => {
    checkIfWeekSelected().then(setSelectedWeek);
    setTimeout(() => {
      createRiveInstance();
    }, 1000);
  }, []);

  useEffect(() => {
    if (!openDrawer) {
      triggerZoomOut();
      setOpenDrawer(false);
    }
  }, [openDrawer]);

  return (
    <div
      className="-translate-y-20"
      id={canvasId === "canvas-front-body" ? "front" : "back"}
    >
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
                        {machineSelected.startingResistance}
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
                <div className="relative">
                  <small
                    className={`absolute left-0 bottom-[26px] ${
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
                    className={`absolute left-0 bottom-[15px] ${
                      records.length === 0 && "hidden"
                    }`}
                  >
                    Weight <br />
                    (Kg)
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
                    className={`absolute left-0 bottom-0 ${
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
              type="submit"
              form="machine-form"
              disabled={!selectedWeek?.lastDayOfWeek}
            >
              Save and rest
            </Button>
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

      <div className="flex flex-col justify-center items-center">
        <canvas className="mask-fade" id={canvasId} width="390" height="844" />
      </div>
    </div>
  );
}
