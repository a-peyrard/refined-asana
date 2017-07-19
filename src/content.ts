import * as $ from 'jquery';
import * as elementReady from 'element-ready';
import { Tweak } from './Tweak'
import MineBoardFilter from './libs/MineBoardFilter'

const tweaks: Tweak[] = [
    /*
        to be filled up with tweak to apply...
    */
    new MineBoardFilter()
];

// main application of tweaks when asana page is displayed
elementReady('#asana_ui').then((asana: any) => setTimeout(
    () => applyTweaks(asana),
    500
));

async function applyTweaks(asana: any) {
    if (tweaks.length === 0) {
        console.log('no tweak configured!')
    }
    const results = await Promise.all(tweaks.map(t => t.apply(asana)));
    results.forEach(
        (r, idx) => printTweakResult(tweaks[idx], r)
    );
}

function printTweakResult(tweak: Tweak, result: boolean) {
    console.log(`[TWEAK] ${tweak.name} {${result ? 'APPLIED' : 'SKIPPED'}}`);
}