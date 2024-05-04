import { Button, Card, CardBody, CardFooter, Skeleton, Switch, Tab, Tabs } from "@nextui-org/react";
import { MetaFunction } from "@remix-run/node";
import { Form, Formik, useFormikContext } from "formik";
import FlexSpacer from "~/components/spacer";
import CustomInput from "~/components/forms/input";
import Page from "~/components/page";
import { ApiError, AppSettings, settingsSchema } from "~/models";
import { IoSaveOutline } from "react-icons/io5";
import { toastError, toastSuccess } from "~/components/toast";
import { useApiFetch, useJsonFetch } from "~/hooks";

export const meta: MetaFunction = () => {
  return [
    { title: "Settings" },
    { name: "settings" },
  ];
}

export default function Index() {
  const { status, data: settings } = useJsonFetch<AppSettings>({
    input: '/api/settings',
  }, [])
  console.log('settings', settings)
  // const { data: settings } = useLoaderData<typeof loader>()
  const apiFetch = useApiFetch()

  const onSubmit = async (values: AppSettings) => {
    try {
      const res = await apiFetch(`/settings/update`, {
        method: 'POST',
        body: JSON.stringify(values)
      })
      if (!res.ok) {
        const err = await res.json() as ApiError
        toastError(err.message) 
        return
      }
      console.log('success')
      toastSuccess('Settings updated!')
    }
    catch (err) {
      toastError((err as Error).message) 
    }
  }
  const isLoaded = status !== 'fetching'

  return (
    <Page title="Settings">
      <Formik initialValues={settings!} enableReinitialize
        validationSchema={settingsSchema} 
        onSubmit={onSubmit}
      >
        {formik => (
          <Form className="flex">
            <div className="hidden sm:flex flex-grow"/>
            <div className="flex flex-col flex-grow max-w-[600px] sm:min-w-[600px]">
              <Card>
                <CardBody>
                  <Tabs aria-label="settings">
                    <Tab key={'ping'} title={'Ping'} >
                      <Skeleton isLoaded={isLoaded} className="rounded-lg">
                        <PingSettings/>
                      </Skeleton>
                    </Tab>
                    <Tab key={'ssh'} title={'SSH'}>
                      <Skeleton isLoaded={isLoaded} className="rounded-lg">
                        <SshSettings/>
                      </Skeleton>
                    </Tab>
                    {/* <Tab key={'other'} title={'Other'}>
                      other
                    </Tab> */}
                  </Tabs>
                </CardBody>
                <CardFooter className="flex flex-row">
                  <FlexSpacer/>
                  <Button isDisabled={!formik.isValid} color="primary" startContent={<IoSaveOutline/>} type="submit">Save</Button>
                </CardFooter>
              </Card>
            </div>
            <div className="hidden sm:flex flex-grow"/>
          </Form>
        )}
      </Formik>
    </Page>
  )
}

function SshSettings() {
  const ctx = useFormikContext()
  return (
    <div className="mt-2 flex flex-col gap-4">
      <CustomInput label="Default user" 
        isRequired
        id='ssh.defaultUser'
        description="Default user for ssh operations"/>
      <Switch {...ctx.getFieldProps('ssh.strictHostKeyChecking')}
        defaultSelected={ctx.getFieldMeta<boolean>('ssh.strictHostKeyChecking').value}>
        Strict Host Key Checking
      </Switch>
    </div>
  )
}

function PingSettings() {
  return (
    <div className="mt-2">
      <CustomInput isRequired id="ping.attempts" label="Max attempts" type="number"/>
    </div>
  )
}