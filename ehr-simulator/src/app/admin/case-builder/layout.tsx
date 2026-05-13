import { FormContextProvider } from "@/context/FormContext"

export const dynamic = "force-dynamic"

const FormLayout = ({ children }: { children: React.ReactNode }) => {

  return (
    <FormContextProvider>
      {children}
    </FormContextProvider>
  )
}

export default FormLayout