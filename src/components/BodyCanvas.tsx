import { useEffect, useRef, useState } from "react";
import * as rive from "@rive-app/canvas";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { machines } from "@/data/data";
import { addRecord, getRecords } from "@/services/records.service";
import type { Machine, Record } from "@/lib/types";

type BodyCanvasProps = {
  canvasId: string;
};

export default function BodyCanvas({ canvasId }: BodyCanvasProps) {
  const [muscleSelected, setMuscleSelected] = useState<string>("");
  const [machineSelected, setMachineSelected] = useState<Machine>();
  const [openMachineDrawer, setOpenMachineDrawer] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [records, setRecords] = useState<Record[]>([]);

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
    setOpenMachineDrawer(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const record: Record = {
      id: Date.now(),
      reps: Number(formData.get("reps")),
      rest: 0,
      weight: Number(formData.get("weight")),
      machineId: machineSelected?.id || 0,
    };

    handleAddRecord(record);
  };

  const handleAddRecord = async (newRecord: Record) => {
    if (!newRecord.machineId) return;

    await addRecord(newRecord);
    setRecords([...records, newRecord]);
  };

  useEffect(() => {
    setTimeout(() => {
      createRiveInstance();
    }, 500);
  }, []);

  useEffect(() => {
    if (!openDrawer) {
      triggerZoomOut();
      setOpenDrawer(false);
    }
  }, [openDrawer]);

  return (
    <div
      className="relative -translate-y-20"
      id={canvasId === "canvas-front-body" ? "front" : "back"}
    >
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
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

      <Drawer open={openMachineDrawer} onOpenChange={setOpenMachineDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle asChild>
              <div className="rounded-md p-2 border mb-6 relative">
                <div className="flex items-center space-x-4">
                  <img
                    src={machineSelected?.image}
                    alt={`Machine ${machineSelected?.id}`}
                    className="bg-slate-100 rounded-md size-16 object-contain"
                  />
                  <h6>{machineSelected?.name}</h6>
                </div>
              </div>
            </DrawerTitle>
            <DrawerDescription asChild>
              <div>
                <div className="relative">
                  <small
                    className={`absolute left-0 bottom-[26px] ${
                      records.length === 0 && "hidden"
                    }`}
                  >
                    Weight (Kg)
                  </small>
                  <div className="flex space-x-1 items-end justify-center pl-4">
                    {records.slice(-10).map((record) => (
                      <div key={`weight-${record.id}`}>
                        <div
                          className={`w-4 bg-amber-400 flex justify-center`}
                          style={{ height: record.weight / 1.5 + "px" }}
                        />
                        <small className="block text-center">
                          {record.weight}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <small
                    className={`absolute bottom-[19px] ${
                      records.length === 0 && "hidden"
                    }`}
                  >
                    Reps
                  </small>
                  <div className="flex space-x-1 items-end justify-center pl-4 mt-4">
                    {records.slice(-10).map((record) => (
                      <div key={`rep-${record.id}`}>
                        <div
                          className={`w-4 bg-green-400 flex justify-center`}
                          style={{ height: record.reps + "px" }}
                        />
                        <small className="block text-center">
                          {record.reps}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <form
              id="machine-form"
              className="space-x-2 grid grid-cols-2"
              onSubmit={handleSubmit}
            >
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
            </form>
          </div>
          <DrawerFooter>
            <Button type="submit" form="machine-form">
              Save
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="flex flex-col justify-center items-center">
        <canvas className="mask-fade" id={canvasId} width="390" height="844" />
      </div>
    </div>
  );
}
