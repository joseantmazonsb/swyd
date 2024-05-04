# swyd

Tired of manually booting up and powering off your LAN devices using the terminal? Try **swyd** instead! 

## Key features

- Check whether your devices are currently online and turn them on and off by simply pressing a button
- Create and restore backups (**snapshots**)
- Provides out of the box username/passsword authentication to secure the access
- Fully responsive UI! Turn on your media server using your phone!

## Prerrequisites

**swyd** is just a friendly user interface to operate your devices. 

You will still need to:
- Enable wake-on-lan capabilities in all devices you would like to remotely turn on
- Install the SSH credentials of the server hosting **swyd** in all devices you would like to remotely turn off (`ssh-copy-id`).

## Screenshots

![Devices page](./docs/images/devices.png)
![Settings page 1](./docs/images/settings1.png)
![Settings page 2](./docs/images/settings2.png)
![Snapshots page](./docs/images/snapshots.png)
![Account page](./docs/images/account.png)
![Menu](./docs/images/menu.png)