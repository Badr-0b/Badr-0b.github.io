/* CLEAVE — the RV32I core as a TinyTapeout 1×1 tile on sky130 (plan view).
   Floorplan → placement → clock tree → routing → sign-off, as it was hardened. */

import { buildDie } from './die';

export const cleave = buildDie({
    id: 'cleave',
    seed: 'cleave-rv32i',
    title: 'Plan view of the CLEAVE tile: I/O pins, power straps, placed standard cells, an H-tree clock and routing, with the RV32I modules outlined.',
    w: 640,
    h: 452,
    die: { x: 64, y: 64, w: 512, h: 354 },
    pins: [
        { label: 'ui_in[7:0]', count: 8 },
        { label: 'uo_out[7:0]', count: 8 },
        { label: 'uio[7:0]', count: 8 },
        { label: 'clk rst_n ena', count: 3 },
    ],
    clockGroup: 3,
    straps: 4,
    rowH: 10.4,
    clock: '25 MHz',
    modules: [
        { id: 'rf', name: 'REGFILE', note: 'Register file — 32 × 32', box: { x: 96, y: 98, w: 168, h: 136 }, balloon: [30, 166] },
        { id: 'alu', name: 'ALU', note: 'Arithmetic logic unit', box: { x: 286, y: 98, w: 120, h: 96 }, balloon: [612, 146] },
        { id: 'dmem', name: 'DMEM', note: 'Data memory — byte-addressable', box: { x: 428, y: 98, w: 118, h: 214 }, balloon: [612, 205] },
        { id: 'br', name: 'BRANCH', note: 'Branch comparator', box: { x: 286, y: 216, w: 120, h: 96 }, balloon: [612, 290] },
        { id: 'pc', name: 'PC', note: 'Program counter', box: { x: 96, y: 256, w: 72, h: 56 }, balloon: [30, 284] },
        { id: 'imm', name: 'IMM', note: 'Immediate generator', box: { x: 186, y: 256, w: 78, h: 56 }, balloon: [30, 230] },
        { id: 'ctl', name: 'CTRL', note: 'Control unit', box: { x: 96, y: 334, w: 310, h: 56 }, balloon: [30, 362] },
        { id: 'dbg', name: 'DBG', note: 'Debug port — the benches read state through it', box: { x: 428, y: 334, w: 118, h: 56 }, balloon: [612, 362] },
    ],
    stamp: 'DRC CLEAN · LVS CLEAN',
    foot: 'SKY130 · TINYTAPEOUT 1×1',
    balloons: { io: [612, 40], pwr: [30, 410], cts: [612, 241], stamp: [612, 438] },
});
