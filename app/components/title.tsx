import { packageInfo } from "~/package";

export default function Title() {
  return (
    <h1 className="text-2xl font-semibold text-gray-900 flex gap-2">
      {packageInfo.displayName}
    </h1>
  )
}