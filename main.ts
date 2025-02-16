// Define the MP3 module namespace
namespace mp3Player {

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

    const CMD_DELAY = 6000; // Command delay

    /**
     * MP3Player 类，用于操作 MP3 模块
     */
    export class MP3Player {
        private dataPin: DigitalPin;

        /**
         * 构造函数，初始化引脚并设置音量
         * @param pin 数据引脚
         * @param volume 初始音量，默认为 30
         */
        constructor(pin: DigitalPin, volume: number = 30) {
            this.dataPin = pin;
            pins.digitalWritePin(this.dataPin, 1); // 初始化为高电平
            this.resetModule();
            this.setVolume(volume);
        }

        private createCommand(cmd: number, dataH: number, dataL: number): number {
            return ((cmd << 4) | dataH) << 8 | dataL;
        }

        private sendByte(dat: number): void {
            pins.digitalWritePin(this.dataPin, 0);
            control.waitMicros(5000);
            for (let i = 0; i < 16; i++) {
                if (dat & 0x8000) {
                    pins.digitalWritePin(this.dataPin, 1);
                    control.waitMicros(600);
                    pins.digitalWritePin(this.dataPin, 0);
                    control.waitMicros(200);
                } else {
                    pins.digitalWritePin(this.dataPin, 1);
                    control.waitMicros(200);
                    pins.digitalWritePin(this.dataPin, 0);
                    control.waitMicros(600);
                }
                dat <<= 1;
            }
            pins.digitalWritePin(this.dataPin, 1);
            control.waitMicros(CMD_DELAY);
        }

        /**
         * 设置音量
         * @param volume 音量值，范围 0-30
         */
        //% blockId="mp3player_setVolume" block="%this|set volume %volume" volume.defl=30 volume.min=0 volume.max=30 weight=80
        public setVolume(volume: number): void {
            const command = this.createCommand(0x04, 0x00, Math.clamp(0, 30, volume));
            this.sendByte(command);
        }

        /**
         * 发送 MP3 命令
         * @param cmd 命令类型
         */
        //% blockId="mp3player_mp3Command" block="%this|mp3 CMD %cmd" weight=96
        public mp3Command(cmd: CMD): void {
            let command: number;
            switch (cmd) {
                case CMD.Play:
                    command = this.createCommand(0x06, 0x01, 0x00);
                    break;
                case CMD.Pause:
                    command = this.createCommand(0x06, 0x02, 0x00);
                    break;
                case CMD.Stop:
                    command = this.createCommand(0x06, 0x03, 0x00);
                    break;
                case CMD.PlayPause:
                    command = this.createCommand(0x06, 0x05, 0x00);
                    break;
                case CMD.PreviousTrack:
                    command = this.createCommand(0x02, 0x00, 0x00);
                    break;
                case CMD.NextTrack:
                    command = this.createCommand(0x01, 0x00, 0x00);
                    break;
            }
            this.sendByte(command);
        }

        /**
         * 播放指定曲目
         * @param num 曲目索引
         * @param mode 播放模式，默认为一次播放
         */
        //% blockId="mp3player_playSong" block="%this|play song index %num||mode %mode" num.defl=1 num.min=0 num.max=1023 mode.defl=mp3Player.PlayModeOnceLoop.Once weight=70
        public playSong(num: number, mode?: PlayModeOnceLoop): void {
            const cmd = (mode === PlayModeOnceLoop.Loop) ? 0x0D : 0x03;
            const command = this.createCommand(cmd, (num >> 8) & 0xFF, num & 0xFF);
            this.sendByte(command);
        }

        /**
         * 播放单曲（一次播放）
         * @param num 曲目编号
         */
        //% blockId="mp3player_playTrack" block="%this|play track %num" num.defl=1 num.min=1 num.max=1023 weight=70
        public playTrack(num: number): void {
            this.playSong(num, PlayModeOnceLoop.Once);
        }

        /**
         * 循环播放曲目
         * @param num 曲目编号
         */
        //% blockId="mp3player_loopTrack" block="%this|loop track %num" num.defl=4 num.min=1 num.max=1023 weight=60
        public loopTrack(num: number): void {
            this.playSong(num, PlayModeOnceLoop.Loop);
        }

        /**
         * 播放上一曲
         */
        //% blockId="mp3player_previousTrack" block="%this|previous track" weight=90
        public previousTrack(): void {
            this.sendByte(this.createCommand(0x02, 0x00, 0x00));
        }

        /**
         * 播放下一曲
         */
        //% blockId="mp3player_nextTrack" block="%this|next track" weight=85
        public nextTrack(): void {
            this.sendByte(this.createCommand(0x01, 0x00, 0x00));
        }

        /**
         * 重置模块
         */
        //% blockId="mp3player_resetModule" block="%this|reset module" weight=75
        public resetModule(): void {
            this.sendByte(this.createCommand(0x05, 0x05, 0x00));
            basic.pause(50);
        }

        /**
         * 播放
         */
        //% blockId="mp3player_play" block="%this|Play" weight=95
        public play(): void {
            this.sendByte(this.createCommand(0x06, 0x01, 0x00));
        }

        /**
         * 暂停
         */
        //% blockId="mp3player_pause" block="%this|Pause" weight=94
        public pause(): void {
            this.sendByte(this.createCommand(0x06, 0x02, 0x00));
        }

        /**
         * 停止
         */
        //% blockId="mp3player_stop" block="%this|Stop" weight=93
        public stop(): void {
            this.sendByte(this.createCommand(0x06, 0x03, 0x00));
        }

        /**
         * 切换播放/暂停状态
         */
        //% blockId="mp3player_playPause" block="%this|Play/Pause" weight=92
        public playPause(): void {
            this.sendByte(this.createCommand(0x06, 0x05, 0x00));
        }

        /**
         * 设置播放列表模式
         * @param mode 列表模式，支持循环或随机播放
         */
        //% blockId="mp3player_playListMode" block="%this|play list mode %mode" mode.defl=mp3Player.PlayMode.Loop weight=50
        public playListMode(mode: PlayMode): void {
            let command: number;
            if (mode === PlayMode.Loop) {
                command = this.createCommand(0x06, 0x06, 0x00); // 循环播放
            } else {
                command = this.createCommand(0x0A, 0x02, 0x00); // 随机播放
            }
            this.sendByte(command);
        }
    }

    /**
     * 工厂函数，用于创建新的 MP3Player 对象
     * @param pin 数据引脚
     * @param volume 初始音量（默认30）
     */
    //% blockId="mp3player_create" block="MP3Player at pin %pin with volume %volume" volume.defl=30 volume.min=0 volume.max=30 weight=100 blockSetVariable=player
    export function create(pin: DigitalPin, volume: number = 30): MP3Player {
        return new MP3Player(pin, volume);
    }
}
