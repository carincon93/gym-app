import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BodyCanvas from "./BodyCanvas";
import Front from "@/assets/front.svg";
import Back from "@/assets/back.svg";
import { addMaxGymTime, getMaxGymTime } from "@/services/maxtime.service";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import type { MaxGymTime } from "@/lib/types";

export const BodyTabs = () => {
  const [maxGymTime, setMaxGymTime] = useState<MaxGymTime>();

  const handleAddMaxTime = async () => {
    await addMaxGymTime();
    getMaxGymTime().then(setMaxGymTime);
  };

  useEffect(() => {
    getMaxGymTime().then(setMaxGymTime);
  }, []);

  return (
    <div>
      <div className="fixed bottom-8 right-0 left-0 flex items-center justify-center space-y-2 flex-col z-10">
        <small className="mx-auto px-4">
          <strong>Max hour: </strong>
          {maxGymTime?.maxTime?.toString()}
        </small>
        <Button onClick={handleAddMaxTime} className=" mx-auto">
          Start session
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
