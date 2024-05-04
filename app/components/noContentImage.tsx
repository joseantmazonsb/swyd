import { Image } from "@nextui-org/react";

export default function NoContentImage({
  caption,
  width
}: {
  caption?: string,
  width?: string | number
}) {
  return (
    <div className="flex flex-col gap-2 text-center">
      <Image width={width || 400} src="https://cdn.dribbble.com/users/3821/screenshots/5673869/attachments/1225509/desert.png"/>
      {!!caption && <p>{caption}</p>}
    </div>
  )
}