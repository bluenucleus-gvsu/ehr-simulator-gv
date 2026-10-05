import { FormContextProvider } from "@/context/FormContext"
import { Suspense } from "react"
import { CaseBuilderBootstrap } from "./components/caseBuilderBootstrap"

export const dynamic = "force-dynamic"

const FormLayout = ({ children }: { children: React.ReactNode }) => {

  return (
    <FormContextProvider>
      <Suspense fallback={<main className="min-h-screen w-full bg-slate-50" />}>
        <CaseBuilderBootstrap>{children}</CaseBuilderBootstrap>
      </Suspense>
    </FormContextProvider>
  )
}

export default FormLayout
