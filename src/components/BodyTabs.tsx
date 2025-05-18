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
import { CalendarDays, Database, Hourglass, Menu, Play } from "lucide-react";
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
    getWeek().then(setWeek);
    getMaxGymTime().then(setMaxGymTime);
  }, []);

  return (
    <div>
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
          <Button
            onClick={handleAddMaxTime}
            className="w-full flex-col py-8"
            disabled={!week?.lastDayOfWeek}
          >
            <div className="flex items-center justify-center gap-2">
              <Play />
              Start a new session
            </div>
            <div className="flex items-center justify-center gap-2">
              <ExitIcon />{" "}
              <p className="text-[8px]">{maxGymTime?.maxTime?.toString()}</p>
            </div>
          </Button>

          <Button
            onClick={handleWeek}
            className="flex items-center justify-center"
            size="sm"
            variant={
              !week?.lastDayOfWeek ||
              (week?.lastDayOfWeek && Number(week?.lastDayOfWeek) < Date.now())
                ? "destructive"
                : "outline"
            }
          >
            <Play /> Week{" | "}
            <CalendarDays />
            <p className="text-[8px]">
              {week?.firstDayOfWeek
                ? new Date(week.firstDayOfWeek).toLocaleDateString("en-GB") +
                  " to " +
                  new Date(week.lastDayOfWeek).toLocaleDateString("en-GB")
                : "No week configured"}
            </p>
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

      <Tabs defaultValue="full">
        <TabsList>
          <TabsTrigger value="front" asChild>
            <img src={Front.src} alt="Front icon" />
          </TabsTrigger>
          <TabsTrigger value="back" asChild>
            <img src={Back.src} alt="Back icon" />
          </TabsTrigger>
          <TabsTrigger value="full">
            <img src={Mrv.src} alt="Full icon" className="size-full" />
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
