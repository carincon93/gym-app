import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BodyCanvas from "./BodyCanvas";
import Front from "@/assets/front.svg";
import Back from "@/assets/back.svg";
import Mrv from "@/assets/mrv.svg";
import { addMaxGymTime, getMaxGymTime } from "@/services/maxtime.service";
import { Button } from "./ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useEffect, useState } from "react";
import type { MaxGymTime, Week } from "@/lib/types";
import { deleteDB } from "@/services/connection.service";
import { Database, Hourglass, Menu, Play, Square } from "lucide-react";
import { addWeek, getWeek } from "@/services/week.service";
import { toast } from "sonner";
import FullBodyCanvas from "./FullBodyCanvas";
import ExitIcon from "./icons/ExitIcon";

type CustomDialogProps = {
  children: React.ReactNode;
  title: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CustomDialog = ({
  children,
  title,
  open,
  onOpenChange,
}: CustomDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export const BodyTabs = () => {
  const [week, setWeek] = useState<Week>();
  const [maxGymTime, setMaxGymTime] = useState<MaxGymTime>();
  const [openMenuDialog, setOpenMenuDialog] = useState<boolean>(false);
  const [openHourDialog, setOpenHourDialog] = useState<boolean>(false);
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const handleAddMaxTime = async () => {
    await addMaxGymTime();
    getMaxGymTime().then(setMaxGymTime);

    toast("New session added.");
  };

  const handleRemoveDb = async () => {
    await deleteDB();
    getWeek().then(setWeek);
    getMaxGymTime().then(setMaxGymTime);

    toast("DB deleted.");
  };

  const handleWeek = async () => {
    await addWeek();
    getWeek().then(setWeek);

    toast("New week added.");
  };

  useEffect(() => {
    setOpenMenuDialog(false);

    if (!startTime) return;

    const updateElapsedTime = () => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000)); // In seconds
    };

    updateElapsedTime(); // Calculate when the page has loaded

    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    getWeek().then(setWeek);
    getMaxGymTime().then(setMaxGymTime);
  }, []);

  return (
    <div>
      <span
        className={`absolute text-6xl text-center h-full w-full ${
          startTime === 0 || elapsedTime === 0 ? "hidden" : "flex"
        } items-center justify-center bg-white top-0 left-0 right-0 mx-auto z-50`}
      >
        {elapsedTime}s
      </span>

      <Button
        onClick={() => setOpenMenuDialog(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Menu />
        Menu
      </Button>

      <CustomDialog
        title="Actions"
        open={openMenuDialog}
        onOpenChange={setOpenMenuDialog}
      >
        <div className="flex flex-col gap-4">
          {startTime === 0 ? (
            <Button onClick={() => setStartTime(Date.now())}>
              <Play /> Rest
            </Button>
          ) : (
            <Button onClick={() => setStartTime(0)}>
              <Square /> Rest
            </Button>
          )}

          <Button
            onClick={handleWeek}
            size="sm"
            variant={
              !week?.lastDayOfWeek ||
              (week?.lastDayOfWeek && Number(week?.lastDayOfWeek) < Date.now())
                ? "destructive"
                : "outline"
            }
            disabled={
              !week?.lastDayOfWeek ||
              (week?.lastDayOfWeek && Number(week?.lastDayOfWeek) < Date.now())
                ? undefined
                : true
            }
          >
            <Play /> Week{" | "}
            <strong className="text-xs">
              {week?.firstDayOfWeek
                ? new Date(week.firstDayOfWeek).toLocaleDateString("en-GB") +
                  " to " +
                  new Date(week.lastDayOfWeek).toLocaleDateString("en-GB")
                : "No week configured"}
            </strong>
          </Button>

          <Button
            onClick={handleAddMaxTime}
            className="w-full"
            disabled={!week?.lastDayOfWeek}
          >
            <Play /> Start a session
          </Button>

          <Button
            onClick={() => setOpenHourDialog(true)}
            className="w-full"
            disabled={!maxGymTime?.maxTime}
          >
            <ExitIcon /> Max hour in the gym
          </Button>

          <Button
            onClick={() => setOpenAlertDialog(true)}
            variant="destructive"
            className="w-full"
          >
            <Database />
            Delete database
          </Button>
        </div>
      </CustomDialog>

      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              database and all your training data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction color="red" onClick={handleRemoveDb}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CustomDialog
        title={
          <>
            <Hourglass className="mx-auto" />
          </>
        }
        open={openHourDialog}
        onOpenChange={setOpenHourDialog}
      >
        <div className="text-xs">
          <div className="text-slate-500">
            <strong>Maximum hour you must be in the gym: </strong>
            {maxGymTime?.maxTime?.toString()}
          </div>
        </div>
      </CustomDialog>

      <Tabs defaultValue="full">
        <TabsList>
          <TabsTrigger value="front" asChild>
            <img src={Front.src} alt="Front icon" />
          </TabsTrigger>
          <TabsTrigger value="back" asChild>
            <img src={Back.src} alt="Back icon" />
          </TabsTrigger>
          <TabsTrigger value="full">
            <img src={Mrv.src} alt="Full icon" width={64} />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="front">
          <BodyCanvas canvasId="canvas-front-body" />
        </TabsContent>
        <TabsContent value="back">
          <BodyCanvas canvasId="canvas-back-body" />
        </TabsContent>
        <TabsContent value="full">
          <FullBodyCanvas canvasId="canvas-full-body" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
