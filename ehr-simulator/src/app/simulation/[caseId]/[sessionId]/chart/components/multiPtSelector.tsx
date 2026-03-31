import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"
import { TabsTrigger } from "@/components/ui/tabs"

const MultiPtSelector = () => {





  return (
    <Dialog>
      <DialogTrigger className="py-4 px-6" asChild>
        <TabsTrigger
          value={"multiPtSelect"}
          className="rounded-none bg-gray-200 data-[state=active]:h-10  data-[state=active]:shadow-black/20 ring-none outline-none border border-gray-300 border-b-gray-00 data-[state=active]:bg-gray-100 -mb-[2px] rounded-t-lg flex items-center" // Added flex for alignment
        >
          <Users />
        </TabsTrigger>
      </DialogTrigger>
      <DialogContent className="lg:max-w-4xl h-[85vh]">
        <DialogHeader>
          <DialogTitle>Your Patients</DialogTitle>
          <DialogDescription>
            Click a patient to enter their chart.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col overflow-y-auto gap-3 bg-gray-100 border p-2 rounded-lg inset-shadow-sm  ">
          <div className="flex flex-col justify-start items-center">
            <div className="flex flex-col w-full justify-start bg-white hover:bg-lime-50 gap-2 p-3 rounded-2xl border shadow">
              <div className="w-full flex justify-between ">
                <p className="text-lg font-semibold peer-hover:underline">Smith, Matthew J.</p>
                <p className="">CHS-350-G</p> 
              </div>
              <div className="flex pl-2">
                <div className="flex flex-col gap-2 pr-20">
                  <p className="text-sm"><span className="font-light">MRN: </span>583672</p>
                  <p className="text-sm"><span className="font-light">DOB: </span>06/14/1964</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Label className="text-xs">Attending Physician</Label>
                    <p className="text-sm pt-0.5 pl-2">Dr. Gib Linzman</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs">Code Status</Label>
                    <p className="w-full  text-sm pt-0.5 pl-2">
                      <span className="bg-yellow-200 px-3 py-0.5 rounded-xl">Full</span>
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs">Assigned RN</Label>
                    <p className="text-sm pt-0.5 pl-2">Matthew Smith, RN</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs">Isolation</Label>
                    <p className="text-sm pt-0.5 pl-2">
                      <span className="bg-yellow-200 px-3 py-0.5 rounded-xl">Contact</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-start items-center">
            <div className="flex flex-col w-full justify-start bg-white hover:bg-lime-50 gap-2 p-3 rounded-2xl border shadow">
              <div className="w-full flex justify-between">
                <p className="text-lg font-semibold">Smith, Matthew J.</p>
                <p className="">CHS-350-G</p> 
              </div>
              <div className="flex pl-2">
                <div className="flex flex-col gap-2 pr-20">
                  <p className="text-sm"><span className="font-light">MRN: </span>583672</p>
                  <p className="text-sm"><span className="font-light">DOB: </span>06/14/1964</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Label className="text-xs">Attending Physician</Label>
                    <p className="text-sm pt-0.5 pl-2">Dr. Gib Linzman</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs">Code Status</Label>
                    <p className="w-full  text-sm pt-0.5 pl-2">
                      <span className="bg-yellow-200 px-3 py-0.5 rounded-xl">Full</span>
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs">Assigned RN</Label>
                    <p className="text-sm pt-0.5 pl-2">Matthew Smith, RN</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs">Isolation</Label>
                    <p className="text-sm pt-0.5 pl-2">
                      <span className="bg-yellow-200 px-3 py-0.5 rounded-xl">Contact</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-start items-center">
            <div className="flex flex-col w-full justify-start bg-white hover:bg-lime-50 gap-2 p-3 rounded-2xl border shadow">
              <div className="w-full flex justify-between">
                <p className="text-lg font-semibold">Smith, Matthew J.</p>
                <p className="">CHS-350-G</p> 
              </div>
              <div className="flex pl-2">
                <div className="flex flex-col gap-2 pr-20">
                  <p className="text-sm"><span className="font-light">MRN: </span>583672</p>
                  <p className="text-sm"><span className="font-light">DOB: </span>06/14/1964</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Label className="text-xs">Attending Physician</Label>
                    <p className="text-sm pt-0.5 pl-2">Dr. Gib Linzman</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs">Code Status</Label>
                    <p className="w-full  text-sm pt-0.5 pl-2">
                      <span className="bg-yellow-200 px-3 py-0.5 rounded-xl">Full</span>
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs">Assigned RN</Label>
                    <p className="text-sm pt-0.5 pl-2">Matthew Smith, RN</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs">Isolation</Label>
                    <p className="text-sm pt-0.5 pl-2">
                      <span className="bg-yellow-200 px-3 py-0.5 rounded-xl">Contact</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MultiPtSelector