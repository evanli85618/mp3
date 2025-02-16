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
     * MP3Player class for controlling the MP3 module.
     */
    export class MP3Player {
        private dataPin: DigitalPin;

        /**
         * Constructor: Initialize the pin and set the volume.
         * @param pin Data pin
         * @param volume Initial volume, default is 30.
         */
        constructor(pin: DigitalPin, volume: number = 30) {
            this.dataPin = pin;
            pins.digitalWritePin(this.dataPin, 1); // Initialize high.
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
         * Set volume.
         * @param volume Volume value, range 0-30.
         */
        //% blockId="mp3player_setVolume" block="%player|set volume %volume" volume.defl=30 volume.min=0 volume.max=30 weight=80
        public setVolume(volume: number): void {
            const command = this.createCommand(0x04, 0x00, Math.clamp(0, 30, volume));
            this.sendByte(command);
        }

        /**
         * Send MP3 command.
         * @param cmd Command type.
         */
        //% blockId="mp3player_mp3Command" block="%player|mp3 CMD %cmd" weight=96
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
         * Play song by index.
         * @param num Song index.
         * @param mode Play mode, default is once.
         */
        //% blockId="mp3player_playSong" block="%player|play song index %num||mode %mode" num.defl=1 num.min=0 num.max=1023 mode.defl=mp3Player.PlayModeOnceLoop.Once weight=70
        public playSong(num: number, mode?: PlayModeOnceLoop): void {
            const cmd = (mode === PlayModeOnceLoop.Loop) ? 0x0D : 0x03;
            const command = this.createCommand(cmd, (num >> 8) & 0xFF, num & 0xFF);
            this.sendByte(command);
        }

        /**
         * Play a track once.
         * @param num Track number.
         */
        //% blockId="mp3player_playTrack" block="%player|play track %num" num.defl=1 num.min=1 num.max=1023 weight=70
        //% blockHidden=true
        public playTrack(num: number): void {
            this.playSong(num, PlayModeOnceLoop.Once);
        }

        /**
         * Loop a track.
         * @param num Track number.
         */
        //% blockId="mp3player_loopTrack" block="%player|loop track %num" num.defl=4 num.min=1 num.max=1023 weight=60
        //% blockHidden=true
        public loopTrack(num: number): void {
            this.playSong(num, PlayModeOnceLoop.Loop);
        }

        /**
         * Play the previous track.
         */
        //% blockId="mp3player_previousTrack" block="%player|previous track" weight=90
        //% blockHidden=true
        public previousTrack(): void {
            this.sendByte(this.createCommand(0x02, 0x00, 0x00));
        }

        /**
         * Play the next track.
         */
        //% blockId="mp3player_nextTrack" block="%player|next track" weight=85
        //% blockHidden=true
        public nextTrack(): void {
            this.sendByte(this.createCommand(0x01, 0x00, 0x00));
        }

        /**
         * Reset the module.
         */
        //% blockId="mp3player_resetModule" block="%player|reset module" weight=75
        //% blockHidden=true
        public resetModule(): void {
            this.sendByte(this.createCommand(0x05, 0x05, 0x00));
            basic.pause(50);
        }

        /**
         * Play.
         */
        //% blockId="mp3player_play" block="%player|Play" weight=95
        //% blockHidden=true
        public play(): void {
            this.sendByte(this.createCommand(0x06, 0x01, 0x00));
        }

        /**
         * Pause.
         */
        //% blockId="mp3player_pause" block="%player|Pause" weight=94
        //% blockHidden=true
        public pause(): void {
            this.sendByte(this.createCommand(0x06, 0x02, 0x00));
        }

        /**
         * Stop.
         */
        //% blockId="mp3player_stop" block="%player|Stop" weight=93
        //% blockHidden=true
        public stop(): void {
            this.sendByte(this.createCommand(0x06, 0x03, 0x00));
        }

        /**
         * Toggle play/pause.
         */
        //% blockId="mp3player_playPause" block="%player|Play/Pause" weight=92
        //% blockHidden=true
        public playPause(): void {
            this.sendByte(this.createCommand(0x06, 0x05, 0x00));
        }

        /**
         * Set play list mode.
         * @param mode List mode, supports loop or random play.
         */
        //% blockId="mp3player_playListMode" block="%player|play list mode %mode" mode.defl=mp3Player.PlayMode.Loop weight=50
        public playListMode(mode: PlayMode): void {
            let command: number;
            if (mode === PlayMode.Loop) {
                command = this.createCommand(0x06, 0x06, 0x00); // Loop play.
            } else {
                command = this.createCommand(0x0A, 0x02, 0x00); // Random play.
            }
            this.sendByte(command);
        }
    }

    /**
     * Factory function to create a new MP3Player object.
     * @param pin Data pin.
     * @param volume Initial volume (default is 30).
     */
    //% blockId="mp3player_create" block="MP3Player at pin %pin with volume %volume" volume.defl=30 volume.min=0 volume.max=30 weight=100 blockSetVariable=player
    export function create(pin: DigitalPin, volume: number = 30): MP3Player {
        return new MP3Player(pin, volume);
    }
}
