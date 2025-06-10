import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import type { Climbmill } from "@/lib/types";
import {
  addClimbmillRecord,
  getClimbmillRecords,
} from "@/services/climbmill.service";
import { useEffect, useState } from "react";

type ClimbmillDialogProps = {
  openClimbmillDialog: boolean;
  setOpenClimbmillDialog: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ClimbmillDialog({
  openClimbmillDialog,
  setOpenClimbmillDialog,
}: ClimbmillDialogProps) {
  const [climbmillRecords, setClimbmillRecords] = useState<Climbmill[]>([]);

  const handleAddFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const climbmillRecord: Climbmill = {
      id: Date.now(),
      speed: Number(formData.get("speed")),
      time: Number(formData.get("time")) * 60000, // convert minutes to milliseconds
      stairs: Number(formData.get("stairs")),
    };

    addClimbmill(climbmillRecord);
  };

  const addClimbmill = async (newClimbmill: Climbmill) => {
    if (!newClimbmill.id) return;

    await addClimbmillRecord(newClimbmill);
    setClimbmillRecords([
      ...climbmillRecords,
      { ...newClimbmill, time: newClimbmill.time / 60000 },
    ]);
  };

  useEffect(() => {
    if (!openClimbmillDialog) return;

    getClimbmillRecords().then(setClimbmillRecords);
  }, [openClimbmillDialog]);

  return (
    <Dialog open={openClimbmillDialog} onOpenChange={setOpenClimbmillDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <div className="rounded-md p-2 border mt-4 mb-6 relative">
              <div className="flex items-center justify-between space-x-4">
                <img
                  src="/gym-app/machines/vo2max/climbmill.webp"
                  alt={`Machine Climbmill`}
                  className="bg-slate-100 rounded-md size-16 object-contain"
                />
                <h6>ClimbMill</h6>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              <div className="relative">
                <small
                  className={`absolute left-0 bottom-0 text-[10px] ${
                    climbmillRecords.length === 0 && "hidden"
                  }`}
                >
                  Speed
                </small>
                <div className="flex space-x-1 items-end justify-center">
                  {climbmillRecords.slice(-10).map((climbmillRecord) => (
                    <div
                      key={`rep-${climbmillRecord.id}`}
                      //   onClick={() => handleSelectedClimbmill(climbmillRecord)}
                    >
                      <div
                        className={`w-4 bg-green-400 flex justify-center`}
                        style={{ height: climbmillRecord.speed + "px" }}
                      />
                      <small className="block text-center text-[8px]">
                        {climbmillRecord.speed}
                      </small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-4">
                <small
                  className={`absolute left-0 bottom-0 text-[10px] ${
                    climbmillRecords.length === 0 && "hidden"
                  }`}
                >
                  Time
                </small>
                <div className="flex space-x-1 items-end justify-center">
                  {climbmillRecords.slice(-10).map((climbmillRecord) => (
                    <div
                      key={`time-${climbmillRecord.id}`}
                      //   onClick={() => handleSelectedClimbmill(climbmillRecord)}
                    >
                      <div
                        className={`w-4 bg-amber-400 flex justify-center select-none`}
                        style={{ height: climbmillRecord.time / 1.5 + "px" }}
                      />
                      <small className="block text-center text-[8px]">
                        {climbmillRecord.time}
                      </small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-4">
                <small
                  className={`absolute left-0 bottom-0 text-[10px] ${
                    climbmillRecords.length === 0 && "hidden"
                  }`}
                >
                  Date
                </small>
                <div className="flex items-end justify-center">
                  {climbmillRecords.slice(-10).map((climbmillRecord) => (
                    <div
                      key={`time-${climbmillRecord.id}`}
                      //   onClick={() => handleSelectedClimbmill(climbmillRecord)}
                      style={{ margin: "0 2px" }}
                    >
                      <div className={`flex justify-center select-none`} />
                      <small className="block text-center text-[8px] -rotate-90 w-[16px]">
                        {climbmillRecord.id
                          ? new Date(climbmillRecord.id).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                              }
                            )
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
          id="climbmill-form"
          className="space-x-2 grid grid-cols-2"
          autoFocus={false}
          onSubmit={handleAddFormSubmit}
        >
          <fieldset>
            <Label className="my-2 text-xs" htmlFor="speed">
              Speed *
            </Label>
            <Input
              name="speed"
              id="speed"
              type="number"
              min="0"
              autoComplete="off"
              required
            />
          </fieldset>

          <fieldset>
            <Label className="my-2 text-xs" htmlFor="time">
              Time (Min) *
            </Label>
            <Input
              name="time"
              id="time"
              type="number"
              min="0"
              step="0.1"
              autoComplete="off"
              required
            />
          </fieldset>

          <fieldset>
            <Label className="my-2 text-xs" htmlFor="stairs">
              Stairs *
            </Label>
            <Input
              name="stairs"
              id="stairs"
              type="number"
              min="0"
              autoComplete="off"
              required
            />
          </fieldset>
        </form>
        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>

            <Button type="submit" form="climbmill-form">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
