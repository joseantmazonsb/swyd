import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, Popover, PopoverTrigger, PopoverContent, Listbox, ListboxItem, Chip, Tooltip} from "@nextui-org/react";
import { useLocation } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import { HiLogout } from "react-icons/hi";
import { HiUser, HiUserCircle } from "react-icons/hi2";
import { UserContext } from "~/contexts";
import { useJsonFetch } from "~/hooks";
import { Update } from "~/models";
import { packageInfo } from "~/package";

export default function Index() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)

  const {data: update, status: updateStatus} = useJsonFetch<Update | false>({
    input: '/api/updates'
  }, [])

  useEffect(() => {
    if (updateStatus === 'ok' && update) {
      setIsUpdateAvailable(true)
    }
  }, [update, updateStatus])


  const {data} = useJsonFetch<{username: string}>({
    input: '/api/auth/account'
  }, [])
  const {account, setAccount} = useContext(UserContext)

  useEffect(() => {
    if (data) {
      setAccount(data)
    }
  }, [setAccount, data])

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
      <NavbarBrand className="flex gap-2 items-baseline">
        <div className="flex gap-1 items-baseline">
          <Link href="/" className="font-bold text-inherit">{packageInfo.displayName}</Link>
          <Link href={`${packageInfo.repository.url}/releases/${packageInfo.version}`} className="text-gray-400 text-xs">
            {packageInfo.version}</Link>
        </div>
        {isUpdateAvailable && 
          <Tooltip content="A newer version is available!">
            <Chip as={Link} href={`${packageInfo.repository.url}/releases/latest`} 
              color="secondary" size="sm" variant="flat"
            >Update</Chip>
          </Tooltip> 
        }
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <LinkNavbarItem title="Devices" href="/devices"/>
        <LinkNavbarItem title="Settings" href="/settings"/>
        <LinkNavbarItem title="Snapshots" href="/snapshots"/>
        {/* <LinkNavbarItem title="Plugins" href="/plugins"/> */}
      </NavbarContent>
      <NavbarMenu>
          <NavbarMenuItem><p className="text-sm text-gray-600 mb-2">Hello there, {account?.username}</p></NavbarMenuItem>
        <NavbarMenuItem>
          <LinkNavbarItem title="Devices" href="/devices"/>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <LinkNavbarItem title="Settings" href="/settings"/>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <LinkNavbarItem title="Snapshots" href="/snapshots"/>
        </NavbarMenuItem>
        <div className="flex flex-col mt-8 gap-2">
          <NavbarMenuItem>
            <LinkNavbarItem title="Account" href="/account"/>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <LinkNavbarItem inactiveColor={'danger'} title="Sign out" href="/signout"/>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
      <NavbarContent justify="end" className="hidden sm:flex">
        <NavbarItem className="flex">
        <Popover>
          <PopoverTrigger>
            <span className="cursor-pointer transition hover:text-gray-600 flex gap-2" style={{
              alignItems: 'center'
            }}>
              <HiUser size={'18'}/> {account?.username}
            </span>
          </PopoverTrigger>
          <PopoverContent>
            <Listbox>
              <ListboxItem color="primary" variant="light" key={1} startContent={<HiUserCircle/>} href="/account">Account</ListboxItem>
              <ListboxItem variant='light' key={2} startContent={<HiLogout/>} color="danger" href="/signout">Sign out</ListboxItem>
            </Listbox>
          </PopoverContent>
        </Popover>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}

function LinkNavbarItem({title, href, inactiveColor}: {title: string, href: string, inactiveColor?: "primary" | "foreground" | "secondary" | "success" | "warning" | "danger" }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(href)
  return (
    <NavbarItem isActive={isActive}>
      <Link color={isActive ? 'primary' : inactiveColor ?? 'foreground'} aria-current={isActive ? 'page' : undefined} href={href}>
        {title}
      </Link>
    </NavbarItem>
  )
}