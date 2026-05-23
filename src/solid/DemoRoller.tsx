import {createStore, produce} from 'solid-js/store';
import {evaluateRoll, type RollResult} from "@lib/roller";
import { For, Show } from 'solid-js';
import RollLog from './DemoRollLog';

export default () => {
    let calcElem!: HTMLInputElement;

    const [logs, setLogs] = createStore<Array<RollResult>>([]);

    const spin = (ev: MouseEvent) => {
        const rollResults = evaluateRoll(calcElem.value || '2d20h + 1d4');

        setLogs(produce(state => {
            state.push(rollResults);
            if(state.length > 10) {
                state.shift();
            }
        }));
    }

    return (
      <div class="demo">
        <fieldset class="card">
            <h2>Try running a spin!</h2>
            <div class="scori-input-group">
                <input 
                    ref={calcElem}
                    class="scori-input" 
                    type="text" 
                    name="calc" 
                    id="calculation" 
                    placeholder="2d20h + 1d4 ..." 
                />
                <button class="scori-btn" onClick={spin}>SPIN!</button>
            </div>
        </fieldset>
        <div class="card">
            <h2>
                Log
            </h2>
            <RollLog logs={() => logs} />
        </div>
      </div>  
    );
}