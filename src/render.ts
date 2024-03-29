import { ipcRenderer } from 'electron';

const INIT_TIMER_MINUTES = 25; // minutes
const INIT_TIMER_SECONDS = 0; // seconds

const BREAK_TIMER_MINUTES = 5; // minutes
const BREAK_TIMER_SECONDS = 0; // seconds

let intervalId: ReturnType<typeof setInterval>;
let minutes: number = INIT_TIMER_MINUTES;
let seconds: number = INIT_TIMER_SECONDS;
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
const timer = document.getElementById('timer');

/* SOUNDS VARIABLES */
const clock_start_sound = new Audio("./assets/sounds/clock_start.wav");
const clock_finish_sound = new Audio("./assets/sounds/clock_finish.wav");

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
    runAntiClockwise();
    updateTimerProgress();
}

const timerEnd = ():void => {
    switch(timerStatus){
        case 1:
            stopTimer();
            timerStatus = 2;
            minutes = BREAK_TIMER_MINUTES;
            seconds = BREAK_TIMER_SECONDS;
            updateTimer(BREAK_TIMER_MINUTES, BREAK_TIMER_SECONDS);
            break;
       case 2:
            stopTimer();
            timerStatus = 1;
            minutes = INIT_TIMER_MINUTES;
            seconds = INIT_TIMER_SECONDS;
            updateTimer(INIT_TIMER_MINUTES, INIT_TIMER_SECONDS);
            break;
    }

    showNotif(`Pomodoro App`, `Timer has ran out.`);
    clock_finish_sound.play();
}

const resetTimer = ():void => {
    switch(timerStatus){
        case 1:
            minutes = INIT_TIMER_MINUTES;
            seconds = INIT_TIMER_SECONDS;
            timerStatus = 0;
            break;
        case 2:
            minutes = BREAK_TIMER_MINUTES;
            seconds = BREAK_TIMER_SECONDS;
            timerStatus = 2;
            break;
    }
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
        timerStatus = 1;
    }
    intervalId = setInterval(timerFunctionality, 1000)
}

const timerFunctionality = (): void => {
        timerWork();
        updateTimer(minutes, seconds);

        if (!minutes && !seconds){
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

    showNotif(`Pomodoro App`, `Timer is running.`);
    clock_start_sound.play();
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
    switch(timerStatus){
        case 1:
            minutes = INIT_TIMER_MINUTES;
            seconds = INIT_TIMER_SECONDS;

            updateTimer(INIT_TIMER_MINUTES, INIT_TIMER_SECONDS);
            break;
       case 2:
            minutes = BREAK_TIMER_MINUTES;
            seconds = BREAK_TIMER_SECONDS;

            updateTimer(BREAK_TIMER_MINUTES, BREAK_TIMER_SECONDS);
            break;
    }

    timerStatus = 0;
    stopTimeLoop();
    updateTimerProgress(0)

    pause_timer_button!.style.display = 'none';
    continue_timer_button!.style.display = 'none';
    stop_timer_button!.style.display = 'none';
    start_timer_button!.style.display = 'initial';
}

/* TIMER PROGRESS */ 

const calcPercentage = ():number => {
    const running_timer = (timerStatus == 1)? ((INIT_TIMER_MINUTES * 60) + INIT_TIMER_SECONDS) : ((BREAK_TIMER_MINUTES * 60) + BREAK_TIMER_SECONDS);
    const now = running_timer - ((minutes*60) + seconds);
    const total = running_timer;

    return now*100/total;
}

const updateTimerProgress = (percentage: number = calcPercentage()):void => {
    const cssText = `
        background: -webkit-linear-gradient(90deg, var(--continue_button_background) ${percentage}%, var(--text) ${percentage}%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent` ;
    timer!.style.cssText = cssText;
}

/* WINDOW ACTION FUNCTIONS */

const minimizeApp = (): void => {
    ipcRenderer.send('minimize');
}

const closeApp = (): void => {
    ipcRenderer.send('close');
}

const showNotif = (title: string, body: string): void => {
    ipcRenderer.send('showNotif', title, body);
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
