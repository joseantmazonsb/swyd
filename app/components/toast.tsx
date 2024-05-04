import toast from "react-hot-toast";
import { HiInformationCircle, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";

export function toastSuccess(content: string | React.ReactElement) {
  toast.success(content, {
    position: 'bottom-center',
  })
}

export function toastError(content: string | React.ReactElement) {
  const input = content;
  toast.error(input, {
    position: 'bottom-center',
    // icon: <HiOutlineExclamationCircle color="red" size={'3rem'}/>
  })
}

export function toastWarning(content: string | React.ReactElement) {
  toast.error(content, {
    position: 'bottom-center',
    icon: <HiOutlineExclamationTriangle color="orange" size={'2em'}/>
  })
}

export function toastInfo(content: string | React.ReactElement) {
  toast.success(content, {
    position: 'bottom-center',
    icon: <HiInformationCircle color="blue"/>
  })
}