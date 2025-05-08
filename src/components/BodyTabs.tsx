import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BodyCanvas from "./BodyCanvas";
import Front from "@/assets/front.svg";
import Back from "@/assets/back.svg";

export const BodyTabs = () => {
  return (
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
  );
};
