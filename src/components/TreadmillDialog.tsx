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
import type { Treadmill } from "@/lib/types";
import {
  addTreadmillRecord,
  getTreadmillRecords,
} from "@/services/treadmill.service";
import { useEffect, useState } from "react";

type TreadmillDialogProps = {
  openTreadmillDialog: boolean;
  setOpenTreadmillDialog: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TreadmillDialog({
  openTreadmillDialog,
  setOpenTreadmillDialog,
}: TreadmillDialogProps) {
  const [treadmillRecords, setTreadmillRecords] = useState<Treadmill[]>([]);

  const handleAddFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const treadmillRecord: Treadmill = {
      id: Date.now(),
      speed: Number(formData.get("speed")),
      time: Number(formData.get("time")) * 60000, // convert minutes to milliseconds
      inclineRange: Number(formData.get("inclineRange")),
    };

    addTreadmill(treadmillRecord);
  };

  const addTreadmill = async (newTreadmill: Treadmill) => {
    if (!newTreadmill.id) return;

    await addTreadmillRecord(newTreadmill);
    setTreadmillRecords([
      ...treadmillRecords,
      { ...newTreadmill, time: newTreadmill.time / 60000 }
    ]);
  };

  useEffect(() => {
    if (!openTreadmillDialog) return;

    getTreadmillRecords().then(setTreadmillRecords);
  }, [openTreadmillDialog]);

  return (
    <Dialog open={openTreadmillDialog} onOpenChange={setOpenTreadmillDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <div className="rounded-md p-2 border mt-4 mb-6 relative">
              <div className="flex items-center justify-between space-x-4">
                <img
                  src="/gym-app/machines/vo2max/treadmill.webp"
                  alt={`Machine Treadmill`}
                  className="bg-slate-100 rounded-md size-16 object-contain"
                />
                <h6>TreadMill</h6>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              <div className="relative">
                <small
                  className={`absolute left-0 bottom-0 text-[10px] ${
                    treadmillRecords.length === 0 && "hidden"
                  }`}
                >
                  Speed
                </small>
                <div className="flex space-x-1 items-end justify-center">
                  {treadmillRecords.slice(-10).map((treadmillRecord) => (
                    <div
                      key={`rep-${treadmillRecord.id}`}
                      //   onClick={() => handleSelectedTreadmill(treadmillRecord)}
                    >
                      <div
                        className={`w-4 bg-green-400 flex justify-center`}
                        style={{ height: treadmillRecord.speed + "px" }}
                      />
                      <small className="block text-center text-[8px]">
                        {treadmillRecord.speed}
                      </small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-4">
                <small
                  className={`absolute left-0 bottom-0 text-[10px] ${
                    treadmillRecords.length === 0 && "hidden"
                  }`}
                >
                  Time
                </small>
                <div className="flex space-x-1 items-end justify-center">
                  {treadmillRecords.slice(-10).map((treadmillRecord) => (
                    <div
                      key={`time-${treadmillRecord.id}`}
                      // onClick={() => handleSelectedTreadmill(treadmillRecord)}
                    >
                      <div
                        className={`w-4 bg-amber-400 flex justify-center select-none`}
                        style={{ height: treadmillRecord.time / 1.5 + "px" }}
                      />
                      <small className="block text-center text-[8px]">
                        {treadmillRecord.time}
                      </small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-4">
                <small
                  className={`absolute left-0 bottom-0 text-[10px] ${
                    treadmillRecords.length === 0 && "hidden"
                  }`}
                >
                  Date
                </small>
                <div className="flex items-end justify-center">
                  {treadmillRecords.slice(-10).map((treadmillRecord) => (
                    <div
                      key={`time-${treadmillRecord.id}`}
                      // onClick={() => handleSelectedTreadmill(treadmillRecord)}
                      style={{ margin: "0 2px" }}
                    >
                      <div className={`flex justify-center select-none`} />
                      <small className="block text-center text-[8px] -rotate-90 w-[16px]">
                        {treadmillRecord.id
                          ? new Date(treadmillRecord.id).toLocaleDateString(
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
          id="treadmill-form"
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
            <Label className="my-2 text-xs" htmlFor="inclineRange">
              Incline range *
            </Label>
            <Input
              name="inclineRange"
              id="inclineRange"
              type="number"
              min="0"
              step="0.1"
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

            <Button type="submit" form="treadmill-form">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
