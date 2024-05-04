import { Button, Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import { useNavigate } from "@remix-run/react";
import { Form, Formik } from "formik";
import { Toaster } from "react-hot-toast";
import { InferType, object, ref, string } from "yup";
import CustomInput from "~/components/forms/input";
import FlexSpacer from "~/components/spacer";
import Title from "~/components/title";
import { toastError } from "~/components/toast";
import { ApiError, ApiOk } from "~/models";

const signUpCredentialsSchema = object({
  username: string().required().min(2),
  password: string().required().min(6),
  confirmPassword: string().required().min(6).oneOf([ref('password')], 'Passwords must match'),
})

type SignUpCredentials = InferType<typeof signUpCredentialsSchema>

export default function SignUp() {
  const navigate = useNavigate()
  const onSubmit = async (values: SignUpCredentials) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: values.username,
        password: values.password
      })
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
  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(to left, #E684AE, #79CBCA, #77A1D3)'
    }}>
      <div className="flex flex-col" style={{
        height: '100%'
      }}>
        <FlexSpacer/>
        <Formik initialValues={{
          username: '',
          password: '',
          confirmPassword: ''
        }} validationSchema={signUpCredentialsSchema} enableReinitialize onSubmit={onSubmit}>
          {formik => (
          <Form>
            <div className="flex flex-grow" >
              <FlexSpacer/>
              <div className="flex flex-col gap-8">
                <div className="w-100 text-center">
                  <Title/>
                </div>
                <Card className="flex flex-col flex-grow w-[400px]">
                  <CardHeader className="text-xl font-semibold">
                    Set up
                  </CardHeader>
                  <CardBody className="flex flex-col gap-4">
                    <CustomInput label="Username" id="username" isRequired/>
                    <CustomInput type="password" label="Password" id="password" isRequired/>
                    <CustomInput type="password" label="Confirm password" id="confirmPassword" isRequired/>
                  </CardBody>
                  <CardFooter className="flex">
                    <Button isLoading={formik.isSubmitting} isDisabled={!formik.dirty || !formik.isValid} className="flex flex-grow" color="primary" type="submit">Sign up</Button>
                  </CardFooter>
                </Card>
              </div>
              <FlexSpacer/>
            </div>
          </Form>
          )}
        </Formik>
        <FlexSpacer/>
      </div>
      <Toaster/>
    </div>
  )
}