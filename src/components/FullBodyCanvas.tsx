import { useEffect, useRef, useState } from "react";
import * as rive from "@rive-app/canvas";
import { getWeek } from "@/services/week.service";
import type { Record, Week } from "@/lib/types";
import { getRecords } from "@/services/records.service";

type BodyCanvasProps = {
  canvasId: string;
};

export default function FullBodyCanvas({ canvasId }: BodyCanvasProps) {
  const [week, setWeek] = useState<Week>();
  const [records, setRecords] = useState<Record[]>([]);
  const riveRef = useRef<rive.Rive | null>(null);

  const mrv = (machineIds: string[]) =>
    records.filter((record) =>
      machineIds.includes(record.machineId.toString())
    );

  // Función para crear instancias de animaciones Rive
  const createRiveInstance = () => {
    const chest = mrv(["1", "2"]);

    const COLORS = {
      red: { r: 255, g: 110, b: 96 },
      green: { r: 114, g: 205, b: 113 },
      normal: { r: 159, g: 170, b: 204 },
    };

    const CHEST = {
      range: {
        min: chest.length < 12,
        max: chest.length > 12 && chest.length < 20,
        bad: chest.length > 20,
      },
    };

    console.log(CHEST.range);

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
          // The Rive object is now loaded and ready to use.
          const vmi = instance.viewModelInstance;
          const colorProperty = (colorProperty: string) =>
            vmi?.color(colorProperty);

          colorProperty("GlutesColor")?.rgb(
            COLORS.green.r,
            COLORS.green.g,
            COLORS.green.b
          );
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

  useEffect(() => {
    getWeek().then(setWeek);

    setTimeout(() => {
      createRiveInstance();
    }, 500);
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

  return (
    <div className="relative" id="full">
      <div className="flex flex-col justify-center items-center">
        <canvas className="mask-fade" id={canvasId} width="390" height="844" />
      </div>
    </div>
  );
}
