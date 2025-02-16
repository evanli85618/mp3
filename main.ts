// Define the MP3 module namespace
namespace mp3Player {
    let DATA_PIN: DigitalPin = DigitalPin.P0;
    const CMD_DELAY = 5000; // Command delay

    export enum ControlCommand {
        Play = 0x01,
        Pause = 0x02,
        Stop = 0x04,
        Previous = 0x05,
        Next = 0x06,
        Reset = 0x07
    }

    export enum PlayMode {
        Loop = 0x08,
        Random = 0x09
    }

    //% block="Set pin $pin"
    //% pin.defl=DigitalPin.P0
    //% weight=100
    export function setPin(pin: DigitalPin): void {
        DATA_PIN = pin;
        pins.digitalWritePin(DATA_PIN, 1); // Initialize high
    }

    function createCommand(cmd: number, dataH: number, dataL: number): number {
        return ((cmd << 12) | (dataH << 8) | dataL) & 0xFFFF;
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
    //% volume.min=0 volume.max=10
    //% weight=80
    export function setVolume(volume: number): void {
        const command = createCommand(0x06, 0x00, Math.clamp(0, 10, volume));
        sendByte(command);
    }

    //% block="Play track %num"
    //% num.min=1 num.max=1023
    //% weight=70
    export function playTrack(num: number): void {
        num = Math.clamp(1, 1023, num);
        const command = createCommand(0x03, (num >> 8) & 0xFF, num & 0xFF);
        sendByte(command);
    }

    //% block="Loop track %num"
    //% num.min=1 num.max=1023
    //% weight=60
    export function loopTrack(num: number): void {
        num = Math.clamp(1, 1023, num);
        const command = createCommand(0x04, (num >> 8) & 0xFF, num & 0xFF);
        sendByte(command);
    }

    //% block="List play mode %mode"
    //% mode.shadow="dropdown"
    //% weight=50
    export function listPlayMode(mode: PlayMode): void {
        const command = createCommand(0x0F, mode, 0x00);
        sendByte(command);
    }
}
