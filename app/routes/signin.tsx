import { Button, Card, CardBody, CardFooter, CardHeader, Spinner } from "@nextui-org/react";
import { useNavigate } from "@remix-run/react";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { CustomCheckbox } from "~/components/forms/checkbox";
import CustomInput from "~/components/forms/input";
import { Redirect } from "~/components/redirect";
import FlexSpacer from "~/components/spacer";
import Title from "~/components/title";
import { toastError } from "~/components/toast";
import { ApiError, ApiOk, Credentials, credentialsSchema } from "~/models";

export default function SignIn() {
  const navigate = useNavigate()
  const onSubmit = async (values: Credentials) => {
    console.log(values)
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(values)
    })
    if (!res.ok) {
      const {message} = await res.json() as ApiError
      toastError(message)
      return
    }
    const {data} = await res.json() as ApiOk<string>
    localStorage.setItem('authorization', data)
    navigate('/')
  }
  const [fetching, setFetching] = useState(true)
  const [setup, setSetup] = useState(false)

  useEffect(() => {
    const getData = async () => {
      const res = await fetch('/api/setup')
      const {data: setup} = await res.json() as ApiOk<boolean>
      setSetup(setup)
      setFetching(false)
    }
    getData()
  }, [])

  return (
    <>
      {fetching && <Spinner/>}
      {!fetching && !setup && <Redirect to="/signup"/>}
      {!fetching && setup &&
      <div style={{
        height: '100vh',
        background: 'linear-gradient(to left, #E684AE, #79CBCA, #77A1D3)'
      }}>
        <div className="flex flex-col" style={{
          height: '100%'
        }}>
          <FlexSpacer/>
          <div className="flex flex-row" >
            <FlexSpacer/>
            <Formik initialValues={{
              username: '',
              password: '',
              rememberMe: false
            }} validationSchema={credentialsSchema} enableReinitialize onSubmit={onSubmit}>
              {formik => (
              <Form>
                <div className="flex flex-col gap-8 w-[400px] w-[400px]">
                  <div className="w-100 text-center">
                    <Title/>
                  </div>
                  <Card className="flex flex-col">
                    <CardHeader className="text-xl font-semibold">
                      Sign In
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4">
                      <CustomInput label="Username" id="username" isRequired/>
                      <CustomInput type="password" label="Password" id="password" isRequired/>
                      <CustomCheckbox id="rememberMe" label="Remember me for 7 days"/>
                    </CardBody>
                    <CardFooter className="flex">
                      <Button isLoading={formik.isSubmitting} isDisabled={!formik.dirty || !formik.isValid} className="flex flex-grow" color="primary" type="submit">Sign in</Button>
                    </CardFooter>
                  </Card>
                </div>
              </Form>
              )}
            </Formik>
            <FlexSpacer/>
          </div>
          <FlexSpacer/>
        </div>
        <Toaster/>
      </div>
      }
    </>
  )
}