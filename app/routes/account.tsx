import { Button, Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { Collapsable, Collapse } from "~/components/collapse";
import CustomInput from "~/components/forms/input";
import Page from "~/components/page";
import FlexSpacer from "~/components/spacer";
import { toastError, toastSuccess } from "~/components/toast";
import { UserContext } from "~/contexts";
import { useApiFetch } from "~/hooks";
import { Account, ApiError, ChangePasswordType, changePasswordSchema } from "~/models";

export default function AccountPage() {
  const apiFetch = useApiFetch()

  const [account, setAccount] = useState<Account>()

  const onSubmit = async (values: {username: string}) => {
    try {
      const res = await apiFetch('/api/auth/account', {
        method: 'POST',
        body: JSON.stringify(values)
      })
      if (!res.ok) {
        const {message} = await res.json() as ApiError
        toastError(message)
        return
      }
      toastSuccess('Account updated!')
      setAccount(values)
    }
    catch (e) {
      toastError((e as Error).message)
    }
  }

  const onChangePassword = async (values: ChangePasswordType, formik: FormikHelpers<ChangePasswordType>) => {
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(values)
      })
      if (!res.ok) {
        const {message} = await res.json() as ApiError
        toastError(message)
        return
      }
      formik.resetForm()
      toastSuccess('Password updated!')
    }
    catch (e) {
      toastError((e as Error).message)
    }
  }

  return (
    <UserContext.Provider value={{account, setAccount}}>
      <Page title="Account" overwriteUserContext>
        <div className="flex flex-row">
          <div className="hidden sm:flex flex-grow"/>
          <div className="flex flex-col flex-grow max-w-[600px] sm:min-w-[600px] gap-4">
            <Formik initialValues={{
              username: account?.username ?? ''
            }} onSubmit={onSubmit} enableReinitialize>
              <Form>
                <Collapse>
                {(toggleCollapsed, isCollapsed) => (
                  
                  <Card className="p-4">
                    <CardHeader className="flex">
                      <h3 className='font-semibold text-xl'>Info</h3>
                      <FlexSpacer/>
                      <Button onClick={toggleCollapsed} variant={'light'} isIconOnly>{isCollapsed ? <HiChevronDown/> : <HiChevronUp/>}</Button>
                    </CardHeader>
                    <Collapsable>
                      <CardBody className="flex flex-col gap-4">
                        <CustomInput id={"username"} label="Username" isRequired isLoading={status === 'fetching'}/>
                        {/* <CustomInput id={"password"} label="Password" type="password" isRequired/>
                        <CustomInput id={"confirmPassword"} label="Confirm password" type="password" isRequired/> */}
                      </CardBody>
                      <CardFooter>
                        <div className="hidden sm:flex flex-grow"/>
                        <Button className="flex flex-grow sm:flex-grow-0" type="submit" color="primary">Save</Button>
                      </CardFooter>
                    </Collapsable>
                  </Card>
                )}
                </Collapse>
              </Form>
            </Formik>
            <Formik initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            }} onSubmit={onChangePassword} enableReinitialize validationSchema={changePasswordSchema}>
              {formik => (
              <Form>
                <Collapse defaultCollapsed>
                {(toggleCollapsed, isCollapsed) => (
                  
                  <Card className="p-4">
                    <CardHeader className="flex">
                      <h3 className='font-semibold text-xl'>Change password</h3>
                      <FlexSpacer/>
                      <Button onClick={toggleCollapsed} variant={'light'} isIconOnly>{isCollapsed ? <HiChevronDown/> : <HiChevronUp/>}</Button>
                    </CardHeader>
                    <Collapsable>
                      <CardBody className="flex flex-col gap-4">
                        <CustomInput id={"currentPassword"} label="Current password" type="password" isRequired/>
                        <CustomInput id={"newPassword"} label="New password" type="password" isRequired/>
                        <CustomInput id={"confirmPassword"} label="Confirm new password" type="password" isRequired/>
                      </CardBody>
                      <CardFooter>
                        <div className="hidden sm:flex flex-grow"/>
                        <Button isDisabled={!formik.isValid || !formik.dirty} className="flex flex-grow sm:flex-grow-0" type="submit" color="primary">Submit</Button>
                      </CardFooter>
                    </Collapsable>
                  </Card>
                )}
                </Collapse>
              </Form>
              )}
            </Formik>
          </div>
          <div className="hidden sm:flex flex-grow"/>
        </div>
      </Page>
    </UserContext.Provider>
  )
}