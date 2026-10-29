// The gallery handoff must complete while the source still has moving frames.
import { JOURNEY_EDIT } from './journey-edit.js';
export const JOURNEY_FPS=JOURNEY_EDIT.fps;
export const JOURNEY_LAST_FRAME=(JOURNEY_EDIT.frameCount-1)/JOURNEY_FPS;
export const JOURNEY_DURATION=JOURNEY_LAST_FRAME;
export const JOURNEY_PEEL=JOURNEY_DURATION-1.8;
export const JOURNEY_WALL=JOURNEY_PEEL-1;
export const JOURNEY_FLIGHT_PREROLL=.35;
export const JOURNEY_FLIGHT_PREPARE_AT=.95;
export const JOURNEY_FLIGHT_DURATION=1.65;
export const JOURNEY_FLIGHT_ANTICIPATION=.22;
