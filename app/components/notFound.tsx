import { Card, CardBody, CardHeader } from "@nextui-org/react";

export default function Index() {
  return (
    <div
      style={{
        backgroundImage: 'url(https://i.pinimg.com/originals/d0/96/40/d096401355c0ff8334a9572dc59c5a3c.jpg)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div style={{marginTop: '-10em', minWidth: '@media (min-width: 640px {30em})'}}>
        <Card className="flex flex-grow flex">
          <CardHeader className="font-bold">NOT FOUND</CardHeader>
          <CardBody>Nothing here</CardBody>
        </Card>
      </div>
    </div>
  )
}