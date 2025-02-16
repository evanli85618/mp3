// 定义MP3模块的命名空间
namespace mp3Player {
    // 内部变量声明
    let DATA_PIN: DigitalPin = DigitalPin.P0;
    const CMD_DELAY = 5000; // 命令间延时

    // 指令编码枚举
    enum ControlCommand {
        Play = 0x01,
        Pause = 0x02,
        Stop = 0x04,
        Previous = 0x05,
        Next = 0x06,
        Reset = 0x07
    }

    // 播放模式枚举
    enum PlayMode {
        Loop = 0x08,
        Random = 0x09
    }

    //% block="设置引脚 $pin"
    //% pin.defl=DigitalPin.P0
    export function setPin(pin: DigitalPin): void {
        DATA_PIN = pin;
        pins.digitalWritePin(DATA_PIN, 1); // 初始化拉高
    }

    // 生成指令数据包
    function createCommand(cmd: number, dataH: number, dataL: number): number {
        return ((cmd << 12) | (dataH << 8) | dataL) & 0xFFFF;
    }

    // 发送单字节数据
    function sendByte(dat: number): void {
        // 发送起始信号
        pins.digitalWritePin(DATA_PIN, 0);
        control.waitMicros(5000);

        // 发送16位数据
        for (let i = 0; i < 16; i++) {
            if (dat & 0x8000) { // 发送1
                pins.digitalWritePin(DATA_PIN, 1);
                control.waitMicros(600);
                pins.digitalWritePin(DATA_PIN, 0);
                control.waitMicros(200);
            } else { // 发送0
                pins.digitalWritePin(DATA_PIN, 1);
                control.waitMicros(200);
                pins.digitalWritePin(DATA_PIN, 0);
                control.waitMicros(600);
            }
            dat <<= 1;
        }

        // 恢复高电平
        pins.digitalWritePin(DATA_PIN, 1);
        control.waitMicros(CMD_DELAY);
    }

    //% block="控制命令 $cmd"
    //% cmd.defl=ControlCommand.Play
    export function sendCommand(cmd: ControlCommand): void {
        const command = createCommand(0x0F, cmd, 0x00);
        sendByte(command);
    }

    //% block="设置音量 %volume"
    //% volume.min=0 volume.max=10
    export function setVolume(volume: number): void {
        const command = createCommand(0x06, 0x00, Math.clamp(0, 10, volume));
        sendByte(command);
    }

    //% block="播放第 %num 首"
    //% num.min=1 num.max=1023
    export function playTrack(num: number): void {
        num = Math.clamp(1, 1023, num);
        const command = createCommand(0x03, (num >> 8) & 0xFF, num & 0xFF);
        sendByte(command);
    }

    //% block="循环播放第 %num 首"
    //% num.min=1 num.max=1023
    export function loopTrack(num: number): void {
        num = Math.clamp(1, 1023, num);
        const command = createCommand(0x04, (num >> 8) & 0xFF, num & 0xFF);
        sendByte(command);
    }

    //% block="设置播放模式 %mode"
    export function setPlayMode(mode: PlayMode): void {
        const command = createCommand(0x0F, mode, 0x00);
        sendByte(command);
    }
}