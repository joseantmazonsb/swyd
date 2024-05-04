import { HiOutlineComputerDesktop, HiOutlineCpuChip, HiOutlineServer, HiOutlineWifi } from "react-icons/hi2"
import { DeviceType } from "~/models"

export function DeviceIcon({type}: {type: DeviceType}) {
  const size = 24
  switch (type) {
    case 'server':
      return <HiOutlineServer size={size}/>
    case 'router':
      return <HiOutlineWifi size={size}/>
    case 'desktop':
      return <HiOutlineComputerDesktop size={size}/>
    default:
      return <HiOutlineCpuChip size={size}/>
  }
}