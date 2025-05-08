import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BodyCanvas from "./BodyCanvas";
import Front from "@/assets/front.svg";
import Back from "@/assets/back.svg";
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
import { useEffect, useState } from "react";
import type { MaxGymTime, Week } from "@/lib/types";
import { deleteDB } from "@/services/connection.service";
import { Database, Info, Play } from "lucide-react";
import { addWeek, getWeek } from "@/services/week.service";
import { toast } from "sonner";

export const BodyTabs = () => {
  const [week, setWeek] = useState<Week>();
  const [maxGymTime, setMaxGymTime] = useState<MaxGymTime>();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openInfoDialog, setOpenInfoDialog] = useState<boolean>(false);

  const handleAddMaxTime = async () => {
    await addMaxGymTime();
    getMaxGymTime().then(setMaxGymTime);

    toast("New sessiona added.");
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
    getWeek().then(setWeek);
    getMaxGymTime().then(setMaxGymTime);
  }, []);

  return (
    <div>
      <div className="fixed px-2 w-full left-0 bottom-16 z-20 flex items-center justify-between">
        <Button onClick={() => setOpenDialog(true)} variant="destructive">
          <Database />
          <span className="-translate-x-1 font-black">X</span>
        </Button>

        <Button onClick={handleAddMaxTime}>
          <Play /> Session
        </Button>

        <Button onClick={handleWeek}>
          <Play /> Week
        </Button>

        <Button onClick={() => setOpenInfoDialog(true)}>
          <Info />
        </Button>
      </div>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
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

      <AlertDialog open={openInfoDialog} onOpenChange={setOpenInfoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Info</AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
            <div className="text-xs">
              <div className="text-slate-500">
                <strong>Max hour: </strong>
                {maxGymTime?.maxTime?.toString()}
              </div>

              <div className="text-slate-500 mt-2">
                <strong>Week: </strong>
                {week?.firstDayOfWeek && (
                  <>
                    {week?.firstDayOfWeek?.toString() +
                      " to " +
                      week?.lastDayOfWeek?.toString()}
                  </>
                )}
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="fixed bottom-4 right-0 left-0 flex items-center justify-center space-y-2 flex-col z-10"></div>

      <Tabs defaultValue="front">
        <TabsList>
          <TabsTrigger value="front" asChild>
            <img src={Front.src} alt="Front icon" />
          </TabsTrigger>
          <TabsTrigger value="back" asChild>
            <img src={Back.src} alt="Back icon" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="front">
          <BodyCanvas canvasId="canvas-front-body" />
        </TabsContent>
        <TabsContent value="back">
          <BodyCanvas canvasId="canvas-back-body" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
