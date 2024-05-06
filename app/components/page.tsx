import Layout from "./layout";

export default function Index({
  title, subtitle, children, overwriteUserContext
}: {
  title: string, subtitle?: string, children: React.JSX.Element, overwriteUserContext?: boolean
}) {

  return (
    <Layout overwriteUserContext={overwriteUserContext}>
      <div className="flex flex-col m-6 gap-10">
        <div className="flex flex-col gap-4 text-center">
          <h1 className=" font-semibold text-3xl">{title}</h1>
          {subtitle && <h2 className="text-md text-gray-500 dark:text-gray-300">{subtitle}</h2>}
        </div>
        {children}
      </div>
    </Layout>
  )
}