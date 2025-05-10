import { useEffect, useRef, useState } from "react";
import * as rive from "@rive-app/canvas";
import { addWeek, getWeek } from "@/services/week.service";
import type { Record, Week } from "@/lib/types";
import { getRecords } from "@/services/records.service";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Info, Play } from "lucide-react";

type BodyCanvasProps = {
  canvasId: string;
};

export default function FullBodyCanvas({ canvasId }: BodyCanvasProps) {
  const [week, setWeek] = useState<Week>();
  const [records, setRecords] = useState<Record[]>([]);
  const riveRef = useRef<rive.Rive | null>(null);
  const [opeDialog, setOpenDialog] = useState<boolean>(false);

  const COLORS = {
    excess: { r: 255, g: 110, b: 96 },
    optimum: { r: 114, g: 205, b: 113 },
    minimum: { r: 211, g: 172, b: 235 },
    inactive: { r: 159, g: 170, b: 204 },
  };

  const mrv = (machineIds: string[]) =>
    records.filter((record) =>
      machineIds.includes(record.machineId.toString())
    );

  const chest = mrv(["1", "2", "3", "4", "5", "6"]);
  const quads = mrv(["7", "8", "9", "10"]);
  const abs = mrv(["11", "12"]);
  const obliques = mrv(["13"]);
  const biceps = mrv(["14", "15", "16", "17", "18", "53"]);
  const shoulders = mrv(["19", "20", "21", "22"]);
  const forearms = mrv(["23", "24"]);
  const adductors = mrv(["25"]);
  const calves = mrv(["26", "27", "28"]);
  const traps = mrv(["29", "30"]);
  const neck = mrv(["31", "32"]);
  const hips = mrv(["33", "34", "35", "36"]);
  const hamstrings = mrv(["37", "38"]);
  const glutes = mrv(["39", "40", "41"]);
  const lats = mrv(["42", "43", "44", "45", "46", "47", "54"]);
  const triceps = mrv(["48", "49", "50", "51"]);
  const lowerBack = mrv(["52"]);

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
        src: "/gym-app/animations/full-body.riv",
        autoBind: true,
        onLoad: () => {
          const checkOptimalSetsByWeek = (qty: number) => ({
            status:
              qty === 0
                ? COLORS.inactive
                : qty < 12
                ? COLORS.minimum
                : qty <= 20
                ? COLORS.optimum
                : COLORS.excess,
          });

          // The Rive object is now loaded and ready to use.
          const vmi = instance.viewModelInstance;
          const colorProperty = (colorProperty: string) =>
            vmi?.color(colorProperty);

          const setMuscleColor = (muscleName: string, sets: number) => {
            const status = checkOptimalSetsByWeek(sets).status;
            colorProperty(`${muscleName}Color`)?.rgb(
              status.r,
              status.g,
              status.b
            );
          };

          setMuscleColor("Biceps", biceps.length);
          setMuscleColor("Traps", traps.length);
          setMuscleColor("Obliques", obliques.length);
          setMuscleColor("Calves", calves.length);
          setMuscleColor("Glutes", glutes.length);
          setMuscleColor("Lats", lats.length);
          setMuscleColor("Neck", neck.length);
          setMuscleColor("Quads", quads.length);
          setMuscleColor("Adductors", adductors.length);
          setMuscleColor("Hips", hips.length);
          setMuscleColor("LowerBack", lowerBack.length);
          setMuscleColor("Hamstrings", hamstrings.length);
          setMuscleColor("Triceps", triceps.length);
          setMuscleColor("Forearms", forearms.length);
          setMuscleColor("Abs", abs.length);
          setMuscleColor("Shoulders", shoulders.length);
          setMuscleColor("Chest", chest.length);
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

  const handleWeek = async () => {
    await addWeek();
    getWeek().then(setWeek);

    toast("New week added.");
  };

  useEffect(() => {
    getWeek().then(setWeek);
  }, []);

  useEffect(() => {
    if (!week) return;

    getRecords(null).then((records) => {
      setRecords(
        records.filter(
          (record) =>
            record.id > Number(week?.firstDayOfWeek) &&
            record.id < Number(week?.lastDayOfWeek)
        )
      );
    });
  }, [week]);

  useEffect(() => {
    setTimeout(() => {
      createRiveInstance();
    }, 500);
  }, [records]);

  return (
    <div className="relative" id="full">
      <div className="flex flex-col justify-center items-center">
        <canvas id={canvasId} width="390" height="844" />

        <div className="fixed bottom-22 left-0 right-0 text-center text-slate-500 mt-2 text-xs px-4 md:w-5/12 mx-auto">
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
                  {">"} 12 sets and {"<"} 20 sets per muscle group{" "}
                  <strong className="text-[10px]">(Recommended)</strong>
                </span>
              </div>
              <div className="flex items-center text-left space-x-2">
                <figure
                  className="size-4 rounded-full"
                  style={{
                    background: `rgb(${COLORS.excess.r}, ${COLORS.excess.g}, ${COLORS.excess.b})`,
                  }}
                />
                <span>{">"} 20 sets per muscle group</span>
              </div>
              <Button onClick={() => setOpenDialog(true)} variant="outline">
                <Info />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={opeDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sets per muscle group</AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
            <div className="text-xs">
              <ul>
                <li>{chest.length} sets for chest</li>
                <li>{quads.length} sets for quads</li>
                <li>{abs.length} sets for abs</li>
                <li>{obliques.length} sets for obliques</li>
                <li>{biceps.length} sets for biceps</li>
                <li>{shoulders.length} sets for shoulders</li>
                <li>{forearms.length} sets for forearms</li>
                <li>{adductors.length} sets for adductors</li>
                <li>{calves.length} sets for calves</li>
                <li>{traps.length} sets for traps</li>
                <li>{neck.length} sets for neck</li>
                <li>{hips.length} sets for hips</li>
                <li>{hamstrings.length} sets for hamstrings</li>
                <li>{glutes.length} sets for glutes</li>
                <li>{lats.length} sets for lats</li>
                <li>{triceps.length} sets for tricpes</li>
                <li>{lowerBack.length} sets for lower back</li>
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
