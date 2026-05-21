import { getTemplates } from "@/actions/cases";
import TemplateListItem from "./TemplateListItem";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="w-full">
      <header className="bg-white border-b px-8 py-4 pb-4 sticky top-0 z-10">
        <div className="space-y-1">
          <h1 className="text-5xl font-bold tracking-tight">TEMPLATES</h1>
          <p className="text-xs text-gray-500">
            Select a template to pre-fill the case builder. Your edits create a brand-new case — the original template is never modified.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-4 p-4">
        {templates.length > 0 ? (
          templates.map((t) => <TemplateListItem key={t.id} template={t} />)
        ) : (
          <div className="flex justify-center items-center border border-dashed border-gray-300 rounded-md h-20">
            <p className="font-semibold text-gray-300">No templates available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
