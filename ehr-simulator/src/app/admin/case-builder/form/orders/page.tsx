"use client"
import { useEffect, useState } from "react"
import {
  X,
  Plus,
  Stethoscope,
  FlaskConical,
  Wind,
  UserRound,
  ClipboardList,
  AlertCircle,
  ChevronDown,
  Utensils,
  Pill
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { OrderType } from "@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData"
import { useFormContext } from "@/context/FormContext"
import { FormShell } from "../../components/formShell"
import { Checkbox } from "@/components/ui/checkbox"
import { saveCaseData } from "@/actions/case_builder/caseBuilder"
import { CaseSection } from "@/lib/saveCase"

const categories: OrderType["category"][] = ["Nursing", "Respiratory", "Laboratory", "Consult", "Diet", "Medication"]

const getCategoryIcon = (cat: string | undefined) => {
  switch (cat) {
    case "Nursing": return <Stethoscope className="w-4 h-4" />;
    case "Respiratory": return <Wind className="w-4 h-4" />;
    case "Laboratory": return <FlaskConical className="w-4 h-4" />;
    case "Consult": return <UserRound className="w-4 h-4" />;
    case "Diet": return <Utensils className="w-4 h-4" />;
    case "Medication": return <Pill className="w-4 h-4" />;
    default: return <ClipboardList className="w-4 h-4" />;
  }
}

const getCategoryColor = (cat: string | undefined) => {
  switch (cat) {
    case "Nursing": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Respiratory": return "bg-cyan-100 text-cyan-700 border-cyan-200";
    case "Laboratory": return "bg-purple-100 text-purple-700 border-purple-200";
    case "Consult": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Diet": return "bg-lime-100 text-lime-700 border-lime-200";
    case "Medication": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function OrdersForm() {
  const router = useRouter();
  const { onDataChange, orderData, caseId } = useFormContext();

  const [orders, setOrders] = useState<OrderType[]>(orderData);

  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<string>("Active");
  const [provider, setProvider] = useState("");
  const [important, setImportant] = useState(false)
  const [excludeFromPresim, setExcludeFromPresim] = useState<boolean>(false)

  const [canAddOrder, setCanAddOrder] = useState<boolean>(false);


  useEffect(() => {
    setCanAddOrder([category, title, provider].every(s => s.trim() !== ""));
  }, [category, title, details, status, provider]);

  const clearForm = () => {
    setTitle("")
    setDetails("")
    setStatus("Active")
    setImportant(false)
  }

  const createOrder = () => {
    setOrders([...orders, {
      category: category as OrderType["category"],
      title,
      details,
      status: status as OrderType["status"],
      orderingProvider: provider,
      important,
      visibleInPresim: !excludeFromPresim
    }])
    clearForm();
  }

  const removeOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index))
  }

  const goBack = () => {
    onDataChange('orders', orders)
    router.push("/admin/case-builder/form/notes");
  }

  const handleSubmit = async () => {
    onDataChange('orders', orders)

    await saveCaseData({
      payload: orders,
      section: CaseSection.ORDERS,
      caseId: caseId
    })

    router.push('/admin/case-builder/form/labs')
  }

  const handlePresimCheckbox = (check: boolean) => {
    setExcludeFromPresim(check)
  }
  const handleImportantCheckbox = (check: boolean) => {
    setImportant(check)
  }

  return (
    <FormShell
      title="Order Entry"
      icon={<ClipboardList className="text-slate-400" />}
      stepDescription="Step 4 of 9: Create provider and nursing orders"
      onSubmit={handleSubmit}
      goBack={goBack}
      continueButtonText={"Continue"}
      backButtonText="Back"
      continueButtonTooltip="Proceed to Next Page"
      backButtonTooltip="Return to Previous Page"
    >
      <div className="flex flex-col h-screen w-full bg-slate-50/50">
        <div className="flex-1 grid grid-cols-1 2xl:grid-cols-12 gap-6 h-full w-full overflow-y-auto pt-6 pb-30 px-8 lg:px-12 mx-auto">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-slate-200 shadow-sm h-fit pt-0">
              <CardHeader className="bg-slate-50/50 border-b border-slate-200/70 rounded-t-xl pt-3 !pb-3">
                <CardTitle className="text-lg">New Order</CardTitle>
                <CardDescription>Enter order details below</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category <span className="text-red-500">*</span></Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select..." />
                        <ChevronDown />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => {
                          if (c) {
                            return (
                              <SelectItem key={c} value={c}>
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(c)} {c}
                                </div>
                              </SelectItem>
                            )
                          }
                        }

                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Provider <span className="text-red-500">*</span></Label>
                    <Input
                      value={provider}
                      onChange={e => setProvider(e.target.value)}
                      placeholder="e.g. Dr. Smith"
                      className="bg-white"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label>Order Title <span className="text-red-500">*</span></Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Insert Peripheral IV"
                    className="bg-white font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Instructions / Details</Label>
                  <Textarea
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="e.g. 20G or larger, prefer left forearm..."
                    className="bg-white min-h-[100px]"
                  />
                </div>

                <div className="flex gap-16 justify-left items-center">
                  <div className="space-y-2">
                    <Label>Initial Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                        <ChevronDown />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Held">Held</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border rounded-lg" >
                    <div className="flex items-center gap-2 p-2 w-fit">
                      <Checkbox id="presim" checked={excludeFromPresim} onCheckedChange={handlePresimCheckbox} />
                      <Label htmlFor="presim" className="text-sm font-normal cursor-pointer">Exclude from Pre-Sim</Label>
                    </div>
                    <div className="flex items-center gap-2 p-2 h-fit w-fit">
                      <Checkbox id="important" checked={important} onCheckedChange={handleImportantCheckbox} />
                      <Label htmlFor="important" className="text-sm font-normal cursor-pointer">Mark as Important</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="text-slate-300" size={18} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Marking as important will display the order on the Overview EHR page</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={createOrder}
                  disabled={!canAddOrder}
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Order
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold text-slate-600 flex items-center gap-2">
                Current Orders
              </h3>
              <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-200">
                {orders.length} Total
              </Badge>
            </div>

            <div className="space-y-6 h-full overflow-y-auto pr-2">
              {orders.length === 0 && (
                <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                  <ClipboardList className="w-10 h-10 mb-3 opacity-20" />
                  <p className="font-medium">No orders created yet.</p>
                  <p className="text-sm">Use the form to add orders to the case.</p>
                </div>
              )}

              {categories.map(cat => {
                const catOrders = orders.filter(o => o.category === cat);
                if (catOrders.length === 0) return null;

                return (
                  <div key={cat} className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                      {getCategoryIcon(cat)} {cat} Orders
                    </div>

                    <div className="grid gap-">
                      {catOrders.map((order, idx) => {
                        const globalIdx = orders.indexOf(order);

                        return (
                          <div
                            key={idx}
                            className="group relative bg-white first:border-t border-b border-x border-slate-200 first:rounded-t-lg last:rounded-b-lg transition-all flex flex-col md:grid md:grid-cols-13 overflow-hidden"
                          >
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getCategoryColor(order.category)}`} />

                            <div className="md:col-span-2 p-2 pl-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200">
                              <h4 className="font-medium text-xs text-slate-900 leading-tight">{order.title}</h4>
                              {order.important && (
                                <span className="inline-flex w-fit items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-yellow-600 border border-red-100 uppercase tracking-wide">
                                  Important
                                </span>
                              )}
                              {order.visibleInPresim ? (
                                <span className="inline-flex w-fit items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-lime-50 text-lime-600 border border-lime-100 uppercase tracking-wide">
                                  In Pre-Sim
                                </span>
                              ) : (
                                <span className="inline-flex w-fit items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-100 uppercase tracking-wide">
                                  Not in Pre-Sim
                                </span>
                              )}

                            </div>

                            <div className="md:col-span-7 p-2 flex items-center md:border-r bg-slate-50/30">
                              <p className="text-xs tracking-tight text-slate-600  whitespace-pre-wrap">
                                {order.details || <span className="text-slate-400 italic">No additional details.</span>}
                              </p>
                            </div>

                            <div className="md:col-span-2 p-2 flex items-center justify-center md:border-r">
                              <div className="flex items-center  gap-2">
                                <span className="text-xs font-medium text-slate-700">{order.status}</span>
                                <span className={`w-2 h-2 rounded-full ring-2 ring-white shadow-sm ${order.status === 'Active' ? 'bg-green-500' : 'bg-amber-400'}`} />
                              </div>
                            </div>

                            <div className="md:col-span-2 p-2 flex items-center justify-between bg-slate-50/50">
                              {

                              }
                              <span className="text-xs text-slate-500 font-medium text-wrap" title={order.orderingProvider}>
                                {order.orderingProvider}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeOrder(globalIdx)}
                                className="p-1.5 hover:bg-red-100 rounded text-slate-400 hover:text-red-600"
                                title="Remove Order"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {/* </div> */}
      </div>
    </FormShell>
  )
}
