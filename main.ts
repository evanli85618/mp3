// Define the MP3 module namespace
namespace mp3Player {
    let DATA_PIN: DigitalPin = DigitalPin.P0;
    const CMD_DELAY = 6000; // Command delay

    export enum PlayMode {
        //% block="Loop"
        Loop,
        //% block="Random"
        Random
    }

    export enum CMD {
        //% block="Play"
        Play,
        //% block="Pause"
        Pause,
        //% block="Stop"
        Stop,
        //% block="Play/Pause"
        PlayPause,
        //% block="Previous track"
        PreviousTrack,
        //% block="Next track"
        NextTrack
    }

    export enum PlayModeOnceLoop {
        //% block="once"
        Once,
        //% block="loop"
        Loop
    }

    //% block="Set pin $pin"
    //% pin.defl=DigitalPin.P1
    //% weight=100
     function setPin(pin: DigitalPin): void {
        DATA_PIN = pin;
        pins.digitalWritePin(DATA_PIN, 1); // Initialize high
        resetModule();
    }

    //% block="Set pin $pin and volume %volume"
    //% pin.defl=DigitalPin.P0
    //% volume.defl=20 volume.min=0 volume.max=30
    //% weight=99
    export function setPinAndVolume(pin: DigitalPin, volume: number): void {
        setPin(pin);
        setVolume(volume);
    }

    //% block="mp3 CMD $cmd"
    //% cmd.defl=mp3Player.CMD.Play
    //% weight=96
    export function mp3Command(cmd: CMD): void {
        let command;
        switch (cmd) {
            case CMD.Play:
                command = createCommand(0x06, 0x01, 0x00);
                break;
            case CMD.Pause:
                command = createCommand(0x06, 0x02, 0x00);
                break;
            case CMD.Stop:
                command = createCommand(0x06, 0x03, 0x00);
                break;
            case CMD.PlayPause:
                command = createCommand(0x06, 0x05, 0x00);
                break;
            case CMD.PreviousTrack:
                command = createCommand(0x02, 0x00, 0x00);
                break;
            case CMD.NextTrack:
                command = createCommand(0x01, 0x00, 0x00);
                break;
        }
        sendByte(command);
    }

    function createCommand(cmd: number, dataH: number, dataL: number): number {
        return ((cmd << 4) | dataH) << 8 | dataL;
    }

    function sendByte(dat: number): void {
        pins.digitalWritePin(DATA_PIN, 0);
        control.waitMicros(5000);

        for (let i = 0; i < 16; i++) {
            if (dat & 0x8000) {
                pins.digitalWritePin(DATA_PIN, 1);
                control.waitMicros(600);
                pins.digitalWritePin(DATA_PIN, 0);
                control.waitMicros(200);
            } else {
                pins.digitalWritePin(DATA_PIN, 1);
                control.waitMicros(200);
                pins.digitalWritePin(DATA_PIN, 0);
                control.waitMicros(600);
            }
            dat <<= 1;
        }
        pins.digitalWritePin(DATA_PIN, 1);
        control.waitMicros(CMD_DELAY);
    }

    //% block="Set volume %volume"
    //% volume.defl=20 volume.min=0 volume.max=30
    //% weight=80
    export function setVolume(volume: number): void {
        const command = createCommand(0x04, 0x00, Math.clamp(0, 30, volume));
        sendByte(command);
    }

    //% block="Play song index $num || mode $mode"
    //% num.defl=1 num.min=0 num.max=1023
    //% mode.defl=mp3Player.PlayModeOnceLoop.Once
    //% expandableArgumentMode="enabled"
    //% weight=70
    export function playSong(num: number, mode?: PlayModeOnceLoop): void {
        const cmd = (mode === PlayModeOnceLoop.Loop) ? 0x0D : 0x03;
        const command = createCommand(cmd, (num >> 8) & 0xFF, num & 0xFF);
        sendByte(command);
    }

    //% block="Play track %num"
    //% num.defl=1 num.min=1 num.max=1023
    //% weight=70
    function playTrack(num: number): void {
        playSong(num, PlayModeOnceLoop.Once);
    }

    //% block="Loop track %num"
    //% num.defl=4 num.min=1 num.max=1023
    //% weight=60
    function loopTrack(num: number): void {
        playSong(num, PlayModeOnceLoop.Loop);
    }

    //% block="Previous track"
    //% weight=90
    function previousTrack(): void {
        sendByte(createCommand(0x02, 0x00, 0x00));
    }

    //% block="Next track"
    //% weight=85
    function nextTrack(): void {
        sendByte(createCommand(0x01, 0x00, 0x00));
    }

    //% block="Reset module"
    //% weight=75
    function resetModule(): void {
        sendByte(createCommand(0x05, 0x05, 0x00));
        basic.pause(50);
    }

    //% block="Play"
    //% weight=95
    function play(): void {
        sendByte(createCommand(0x06, 0x01, 0x00));
    }

    //% block="Pause"
    //% weight=94
    function pause(): void {
        sendByte(createCommand(0x06, 0x02, 0x00));
    }

    //% block="Stop"
    //% weight=93
    function stop(): void {
        sendByte(createCommand(0x06, 0x03, 0x00));
    }

    //% block="Play/Pause"
    //% weight=92
    function playPause(): void {
        sendByte(createCommand(0x06, 0x05, 0x00));
    }

    //% block="List play mode %mode"
    //% weight=50
    //% mode.defl=mp3Player.PlayMode.Loop  // 设置默认值
    export function listPlayMode(mode: PlayMode): void {
        let command;
        if (mode === PlayMode.Loop) {
            command = createCommand(0x06, 0x06, 0x00); // Loop Play
        } else {
            command = createCommand(0x0A, 0x02, 0x00); // Random Play
        }
        sendByte(command);
    }
}
