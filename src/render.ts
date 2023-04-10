import { ipcRenderer } from 'electron';

const CLOCK_TIME = 25; // minutes
const BREAK_TIME = 5; // minutes

let intervalId: ReturnType<typeof setInterval>;
let minutes: number = CLOCK_TIME;
// 0: Off, 1: On, 2: On pause
let timerStatus: number = 0;

/* TIMER ACTION BUTTONS */
const start_timer_button = document.getElementById('start')
const pause_timer_button = document.getElementById('pause')
const continue_timer_button = document.getElementById('continue')
const stop_timer_button = document.getElementById('stop')

/* ACTION BUTTONS */
const min_icon = document.getElementById('min-icon');
const close_icon = document.getElementById('close-icon');

const timer = document.getElementById('clock');

/* TIMER FUNCTIONALITY */

const runClockwise = (): void => {
    if (seconds + 1 > 59) {
        minutes++;
        seconds = 0
    } else {
        seconds++;
    }
}

const runAntiClockwise = (): void => {
    if (seconds == 0) {
        seconds = 59
        minutes--;
    } else {
        seconds--;
    }
}

const timerWork = (): void => {
    console.log('status: ', timerStatus)
    runAntiClockwise();
}

const timerEnd = ():void => {
    console.log('timer end')
    switch(timerStatus){
        case 1:
            console.log('case 1')
            stopTimer();
            timerStatus = 2;
            minutes = BREAK_TIME;
            updateTimer(BREAK_TIME, 0);
            break;
       case 2:
            console.log('case 2')
            stopTimer();
            timerStatus = 1;
            minutes = CLOCK_TIME;
            updateTimer(CLOCK_TIME, 0);
            break;
    }
}

const resetTimer = ():void => {
    switch(timerStatus){
        case 1:
            minutes = 0;
            seconds = 0;
            timerStatus = 0;
            break;
        case 2:
            minutes = 5;
            seconds = 0;
            timerStatus = 2;
            break;
    }
}

const timerBreak = (): void => {
    minutes = 5;
    seconds = 0;
    runAntiClockwise()
}

const display = (time: number): string => {
    if(time < 10){
        return `0${time}`;
    }
    return `${time}`;
}

const updateTimer = (minutes: number, seconds: number): void => {
    let show_minutes: string = display(minutes);
    let show_seconds: string = display(seconds);

    timer!.innerText = `${show_minutes}:${show_seconds}`;
}

const runTimer = () => {
    if(timerStatus == 0) { 
        console.log('hello');
        timerStatus = 1;
    }
    intervalId = setInterval(timerFunctionality, 1000)
}

const timerFunctionality = (): void => {
        timerWork();
        updateTimer(minutes, seconds);

        // TODO: DO BETTER
        if (
            ( timerStatus === 1 && (!minutes && !seconds) ) ||
            ( timerStatus === 2 && (!minutes && !seconds) )
        ){
            console.log('ended')
            timerEnd();
        }
    }

const restartTimer = () => {
    runTimer();

    continue_timer_button!.style.display = 'none';
    stop_timer_button!.style.display = 'none';
    pause_timer_button!.style.display = 'initial';
}

const startTimer = (): void => {
    runTimer();

    start_timer_button!.style.display = 'none';
    pause_timer_button!.style.display = 'initial'
}

const stopTimeLoop = (): void => {
    clearInterval(intervalId);
}

const pauseTimer = (): void => {
    stopTimeLoop();

    pause_timer_button!.style.display = 'none';
    continue_timer_button!.style.display = 'initial';
    stop_timer_button!.style.display = 'initial';
}

const stopTimer = (): void => {
    timerStatus = 0;
    stopTimeLoop();

    minutes = 0;
    seconds = 0;
    updateTimer(0, 0);

    pause_timer_button!.style.display = 'none';
    continue_timer_button!.style.display = 'none';
    stop_timer_button!.style.display = 'none';
    start_timer_button!.style.display = 'initial';
}
/* WINDOW ACTION FUNCTIONS */
const minimizeApp = (): void => {
    ipcRenderer.send('minimize');
}

const closeApp = (): void => {
    ipcRenderer.send('close');
}

/* TIMER BUTTON EVENTS */

start_timer_button!.addEventListener("click", startTimer);
pause_timer_button!.addEventListener("click", pauseTimer);
continue_timer_button!.addEventListener("click", restartTimer);
stop_timer_button!.addEventListener("click", stopTimer);

/* WINDOW ACTIONS */

min_icon!.addEventListener("click", minimizeApp)
close_icon!.addEventListener("click", closeApp)

/* SETS THE TIMER to assigned value (Ignore html)
*/
updateTimer(minutes, seconds);
