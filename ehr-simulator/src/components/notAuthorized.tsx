export default function NotAuthorized({ children }: { children?: React.ReactNode }) {
  return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Not authorized</h1>
        <p className="text-sm text-muted-foreground">You do not have permission to access this page.</p>
        {children}
      </div>
    </div>
  )
}