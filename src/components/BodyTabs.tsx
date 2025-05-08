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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import type { MaxGymTime, Week } from "@/lib/types";
import { deleteDB } from "@/services/connection.service";
import { Database, Play } from "lucide-react";
import { addWeek, getWeek } from "@/services/week.service";

export const BodyTabs = () => {
  const [week, setWeek] = useState<Week>();
  const [maxGymTime, setMaxGymTime] = useState<MaxGymTime>();
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleAddMaxTime = async () => {
    await addMaxGymTime();
    getMaxGymTime().then(setMaxGymTime);
  };

  const handleRemoveDb = async () => {
    await deleteDB();
  };

  const handleWeek = async () => {
    await addWeek();
    getWeek().then(setWeek);
  };

  useEffect(() => {
    getWeek().then(setWeek);
    getMaxGymTime().then(setMaxGymTime);
  }, []);

  return (
    <div>
      <Button
        className="fixed bottom-5 left-4 z-20"
        onClick={() => setOpenDialog(true)}
        variant="destructive"
      >
        <Database />
        <span className="-translate-x-1 font-black">X</span>
      </Button>

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

      <div className="fixed bottom-5 right-0 left-0 flex items-center justify-center space-y-2 flex-col z-10">
        <small className="mx-auto px-4 text-slate-500">
          <strong>Max hour: </strong>
          {maxGymTime?.maxTime?.toString()}
        </small>

        <small className="mx-auto px-4 text-slate-500">
          <strong>Week: </strong>
          {week?.firstDayOfWeek?.toString()}
        </small>
        <Button onClick={handleAddMaxTime} className=" mx-auto">
          Start session
        </Button>
      </div>

      <div className="fixed bottom-5 right-4 flex items-center justify-center space-y-2 flex-col z-10">
        <Button onClick={handleWeek} className=" mx-auto">
          <Play /> Week
        </Button>
      </div>

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
