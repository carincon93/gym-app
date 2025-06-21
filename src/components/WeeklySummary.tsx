import { useEffect, useRef, useState } from "react";
import * as rive from "@rive-app/canvas";
import type { Record, Week } from "@/lib/types";
import { getAllWeeks } from "@/services/week.service";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getRecords } from "@/services/records.service";
import { Button } from "./ui/button";
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
  neckMachineIds,
  obliquesMachineIds,
  quadsMachineIds,
  shouldersMachineIds,
  trapsMachineIds,
  tricepsMachineIds,
} from "@/data/data";

type BodyCanvasProps = {
  openSummaryDialog: boolean;
  setOpenSummaryDialog: (value: boolean) => void;
};

export default function WeeklySummary({
  openSummaryDialog,
  setOpenSummaryDialog,
}: BodyCanvasProps) {
  const riveRef = useRef<rive.Rive | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [weekSelected, setWeekSelected] = useState<{
    firstDayOfWeek: number;
    lastDayOfWeek: number;
  }>();

  const COLORS = {
    excess: { r: 255, g: 110, b: 96 },
    optimum: { r: 114, g: 205, b: 113 },
    minimum: { r: 211, g: 172, b: 235 },
    inactive: { r: 159, g: 170, b: 204 },
  };

  // Función para crear instancias de animaciones Rive
  const createRiveInstance = () => {
    const canvasElement: HTMLCanvasElement | null = document.getElementById(
      "week-summary"
    ) as HTMLCanvasElement | null;

    if (!canvasElement) {
      console.error(`Canvas with id "week-summary" not found.`);
      return;
    }

    try {
      const instance = new rive.Rive({
        canvas: canvasElement,
        autoplay: true,
        stateMachines: "State Machine 1",
        src: "/gym-app/animations/full-body.riv",
        autoBind: true,
        layout: new rive.Layout({
          fit: rive.Fit.Cover,
          alignment: rive.Alignment.TopCenter,
        }),
        onLoad: () => {
          const checkOptimalSetsByWeek = (qty: number) => ({
            status:
              qty === 0
                ? COLORS.inactive
                : qty < 12
                ? COLORS.minimum
                : qty === 12
                ? COLORS.optimum
                : COLORS.excess,
          });

          // The Rive object is now loaded and ready to use.
          const vmi = instance.viewModelInstance;
          const colorProperty = (colorProperty: string) =>
            vmi?.color(colorProperty);

          const setStringProperty = (propertyName: string, value: string) => {
            const property = vmi?.string(propertyName);
            if (property) {
              property.value = value;
            }
          };

          const setMuscleColor = (muscleName: string, sets: number) => {
            const status = checkOptimalSetsByWeek(sets).status;
            colorProperty(`${muscleName}Color`)?.rgb(
              status.r,
              status.g,
              status.b
            );
          };

          const mrv = (machineIds: string[]) =>
            records.filter((record) =>
              machineIds.includes(record.machineId.toString())
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

          const muscleColorMap = {
            Biceps: biceps,
            Traps: traps,
            Obliques: obliques,
            Calves: calves,
            Glutes: glutes,
            Lats: lats,
            Neck: neck,
            Quads: quads,
            Adductors: adductors,
            Hips: hips,
            LowerBack: lowerBack,
            Hamstrings: hamstrings,
            Triceps: triceps,
            Forearms: forearms,
            Abs: abs,
            Shoulders: shoulders,
            Chest: chest,
          };

          Object.entries(muscleColorMap).forEach(([muscle, records]) => {
            setMuscleColor(muscle, records.length);
          });
        },
      });

      riveRef.current = instance;
    } catch (error) {
      console.error(
        `Error initializing Rive animation for week-summary:`,
        error
      );
    }
  };

  useEffect(() => {
    if (weeks.length === 0) return;

    setWeekSelected({
      firstDayOfWeek: weeks[weeks.length - 1].firstDayOfWeek,
      lastDayOfWeek: weeks[weeks.length - 1].lastDayOfWeek,
    });
  }, [weeks]);

  useEffect(() => {
    if (!weekSelected) return;

    getRecords().then((records) =>
      setRecords(
        records.filter(
          (record) =>
            record.id >= weekSelected.firstDayOfWeek &&
            record.id <= weekSelected.lastDayOfWeek
        )
      )
    );
  }, [weekSelected]);

  useEffect(() => {
    if (!openSummaryDialog) return;

    createRiveInstance();
  }, [records]);

  useEffect(() => {
    getAllWeeks().then(setWeeks);
  }, [openSummaryDialog]);

  return (
    <Dialog open={openSummaryDialog} onOpenChange={setOpenSummaryDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Workout summary</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex flex-col justify-center items-center relative">
          <Select
            onValueChange={(value) => {
              setWeekSelected({
                firstDayOfWeek: Number(value.split(",")[0]),
                lastDayOfWeek: Number(value.split(",")[1]),
              });
            }}
            defaultValue={
              weekSelected
                ? `${weekSelected.firstDayOfWeek},${weekSelected.lastDayOfWeek}`
                : undefined
            }
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Select a week" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((week, index) => (
                <SelectItem
                  key={week.id}
                  value={`${week.firstDayOfWeek},${week.lastDayOfWeek}`}
                >
                  Week #{index + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <canvas
            id="week-summary"
            width="300"
            height="360"
            className="translate-y-10"
          />

          <div className="text-center text-slate-500 mt-2 text-xs w-full">
            <div className="bg-white p-2 rounded-md shadow-md block">
              <strong>Optimal weekly sets</strong>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center text-left space-x-2">
                  <figure
                    className="size-4 rounded-full"
                    style={{
                      background: `rgb(${COLORS.minimum.r}, ${COLORS.minimum.g}, ${COLORS.minimum.b})`,
                    }}
                  />
                  <span>{"<"} 12 sets per muscle group</span>
                </div>
                <div className="flex items-center text-left space-x-2">
                  <figure
                    className="size-4 rounded-full"
                    style={{
                      background: `rgb(${COLORS.optimum.r}, ${COLORS.optimum.g}, ${COLORS.optimum.b})`,
                    }}
                  />
                  <span>
                    <strong className="text-[10px]">(Recommended)</strong>
                    <br />
                    12 sets per muscle group{" "}
                    <span className="text-[10px] text-slate-400">
                      (max. 10 reps, 40s set)
                    </span>
                  </span>
                </div>
                <div className="flex items-center text-left space-x-2">
                  <figure
                    className="size-4 rounded-full"
                    style={{
                      background: `rgb(${COLORS.excess.r}, ${COLORS.excess.g}, ${COLORS.excess.b})`,
                    }}
                  />
                  <span>
                    <strong className="text-[10px]">(Exceeded)</strong>
                    <br />
                    {">"} 12 sets per muscle group
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
