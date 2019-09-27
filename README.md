# Node.js EEG Brain Signals, Machine Learning to Control Sphero 2.0

This application is to translate EEG mental commands from Emotiv Insight to control Sphero 2.0 robot to go forward PUSH, backward PULL. It is tested with Emotiv Insight.


## Demo
[![Watch the video](https://img.youtube.com/vi/TAonz6efaSM/maxresdefault.jpg)](https://youtu.be/TAonz6efaSM)


## Run the app locally

1. [Install Node.js][]
1. cd into this project's root directory
1. Run `npm install` to install the app's dependencies
1. Run `npm npm install ws socket.io-client`
1. Run `npm install axios`
1. Run `npm start` to start the app
1. Access the running app in a browser at <http://localhost:6001/live.html>

[Install Node.js]: https://nodejs.org/en/download/




## Sphero 2.0 

By Mr. Miller Wang please see [here](https://github.com/MTSPD/Sphero)



1. Run `npm install sphero serialport`

## Connecting to Sphero/SPRK

OS X or read the full tutorial for Windows or other OS [here](https://github.com/orbotix/sphero.js)

To connect to your Sphero 1.0/2.0 or SPRK, you first need to pair it. To pair your device on OS X, open the Bluetooth settings in System Preferences > Bluetooth. From this menu, locate your Sphero in the Devices list and click the Pair button to pair it with your computer.

Once you've successfully paired your Sphero, open your terminal, go to your /dev folder and locate the serial device connection (or use ls -a /dev | grep tty.Sphero) for your newly paired Sphero; it should look something like tty.Sphero-RGB-AMP-SPP. Note, your device will likely be different depending on its preset color code (the three colors your Sphero cycles through when you first turn it on). The previous example is for a Sphero with a Red, Green and Blue (RGB) color code.

So, your Sphero port will be at

/dev/tty.Sphero-XXX-XXX-XXX

## Note while try to connect Sphero robot
if any problem with Serialport to Node Server for Sphero please goto node_modules⁩ ▸ ⁨sphero⁩ ▸ ⁨lib⁩ ▸ ⁨adaptors⁩ then change serialport.js the following script (maybe line 54 or 55):

`//port = this.serialport = new serialport.SerialPort(this.conn, {});`
`port = this.serialport = new serialport(this.conn, {});`

