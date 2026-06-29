interface MedCardTable {
  header: { col1: string, col2: string },
  rows: { col1: string, col2: string }[]
}

interface MedAdminCardTableProps {
  table: MedCardTable
}
export const heparinTable: MedCardTable = {
  header: { col1: 'aPTT', col2: 'Action' },
  rows: [
    { col1: '< 35 sec', col2: 'Bolus 60 units/kg, ↑ infusion by 4 units/kg/hr ' },
    { col1: '35-45 sec', col2: 'Bolus 40 units/kg, ↑ infusion by 2 units/kg/hr ' },
    { col1: '46-70 sec', col2: 'No change.' },
    { col1: '71-90 sec', col2: '↓ infusion by 2 units/kg/hr' },
    { col1: '>90 sec', col2: 'Hold infusion 1hr, ↓ infusion by 3 units/kg/hr' },
  ]
}

export const insulinTable: MedCardTable = {
  header: { col1: 'BG Range (mg/dL)', col2: 'Correction Units' },
  rows: [
    { col1: "<70", col2: "0" },
    { col1: "70-150", col2: "6" },
    { col1: "151-200", col2: "8" },
    { col1: "201-250", col2: "10" },
    { col1: "251-300", col2: "12" },
    { col1: "301-350", col2: "14" },
    { col1: "351-400", col2: "16" },
    { col1: ">400", col2: "18" },
  ],

}
const MedAdminCardTable = ({ table }: MedAdminCardTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border max-w-fit">
      <table className="divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {table.header.col1}
            </th>
            <th scope="col" className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              {table.header.col2}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.rows.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
              <td className="whitespace-nowrap pl-2 pr-4 py-1 text-xs text-gray-800">{row.col1}</td>
              <td className="whitespace-nowrap px-2 py-1 text-xs text-gray-800">{row.col2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MedAdminCardTable