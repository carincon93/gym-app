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

type Record = {
  id: number;
  reps: number;
  rest: number;
  weight: number;
  machineId: number;
};

type Machine = {
  id: number;
  name: string;
  image: string;
};

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

  const DB_NAME = "GymDB";
  const STORE_NAME = "records";
  const DB_VERSION = 1;

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getRecords = async (machine: Machine): Promise<Record[]> => {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      // Since IndexedDB doesn't support filtering directly, we'll need to filter after getting results
      request.onsuccess = () => {
        const allRecords = request.result;
        const filteredRecords = allRecords.filter(
          (record) => record.machineId === machine?.id
        );
        resolve(filteredRecords);
      };
    });
  };

  const addRecord = async (record: Record) => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.add(record);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const record: Record = {
      id: Date.now(),
      reps: Number(formData.get("reps")),
      rest: Number(formData.get("rest")),
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
      className="relative"
      id={canvasId === "canvas-front-body" ? "front" : "back"}
    >
      <h1 className="absolute top-0 text-left font-bold text-9xl left-0 right-0 mx-auto z-10 opacity-60 break-all leading-[0.7]">
        {muscleSelected
          ? muscleSelected
          : canvasId === "canvas-front-body"
          ? "Front"
          : "Back"}
      </h1>
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
                      <h6>
                        {machine.name}
                      </h6>
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
              <div className="rounded-md p-2 border flex items-center space-x-4 mb-6">
                <img
                  src={machineSelected?.image}
                  alt={`Machine ${machineSelected?.id}`}
                  className="bg-slate-100 rounded-md size-16 object-contain"
                />
                <h6>{machineSelected?.name}</h6>
              </div>
            </DrawerTitle>
            <DrawerDescription asChild>
              <div>
                <div className="relative">
                  <small
                    className={`absolute -left-[17px] bottom-[26px] -rotate-90 ${
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
                    className={`absolute bottom-[19px] -rotate-90 ${
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
              className="space-x-2 grid grid-cols-3"
              onSubmit={handleSubmit}
            >
              <fieldset>
                <Label className="my-2 text-xs" htmlFor="reps">
                  Reps *
                </Label>
                <Input name="reps" id="reps" type="number" min="0" required />
              </fieldset>

              <fieldset>
                <Label className="my-2 text-xs" htmlFor="rest">
                  Rest (Seconds) *
                </Label>
                <Input name="rest" id="rest" type="number" min="0" required />
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
