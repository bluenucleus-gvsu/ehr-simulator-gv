import { columns } from "./columns"
import { DataTable } from "./data-table"
import { AdminQuickActionsList } from "./components/AdminQuickActionsList"
import { getManagedUsers } from "@/actions/userManagement"

async function getData() {
  return await getManagedUsers();
}

export default async function AdminPage() {
  const data = await getData()
  return (
    <div className="w-full">
      <header className="bg-white border-b px-8 py-4 pb-4 sticky top-0 z-10">
        <div className="space-y-1">
          <h1 className="text-5xl font-bold tracking-tight">DASHBOARD</h1>
          {/* <p className="text-xs text-gray-500">Manage all simulation courses</p> */}
        </div>
      </header>

      <div className="px-4">
        <h2 className="pl-1 pt-5 pb-2 text-xl font-bold">QUICK ACTIONS</h2>
        <AdminQuickActionsList />
        <h2 className="pl-1 pt-5 pb-2 text-xl font-bold">USER MANAGEMENT</h2>
        <div className="w-full">
          <DataTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  )
}
