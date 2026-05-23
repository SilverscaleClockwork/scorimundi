import { create, all } from 'mathjs';

// 1. Create a scoped instance of mathjs
// We create a fresh instance so we don't pollute the global mathjs object
const math = create(all);

// A temporary array to store the results of individual dice rolls during a single evaluation
// This is super useful if you want to show the user exactly what dice were rolled.
let currentRollLog: { dice: string, results: number[] }[] = [];

export type RollModifier = 'normal' | 'adv' | 'dis';

export type RollBreakdown = {
    dice: string;
    results: number[];
};

// A discriminated union based on the 'success' property
export type RollResult = 
    | {
        success: true;
        original: string;
        parsed: string;
        total: number;
        breakdown: RollBreakdown[];
    }
    | {
        success: false;
        original: string;
        error: string;
        total: 0; // Lock total to 0 on failure
        breakdown: never[]; // Empty array on failure
    };

// 2. Define our custom TTRPG functions
const customFunctions = {
    // Generates an array of dice rolls: roll_array(2, 20) -> [14, 7]
    roll_array: function (count: number, sides: number, label?: string): number[] {
        const results: number[] = [];
        for (let i = 0; i < count; i++) {
            results.push(Math.floor(Math.random() * sides) + 1);
        }
        
        // Save to our log so the UI can display the breakdown later
        currentRollLog.push({ dice: label || `${count}d${sides}`, results });
        return results;
    },

    // Keeps the highest N values from an array and sums them
    keep_highest: function (keepCount: number, arr: number[]): number {
        const sorted = [...arr].sort((a, b) => b - a); // Sort descending
        const kept = sorted.slice(0, keepCount);
        return kept.reduce((sum, val) => sum + val, 0);
    },

    // Keeps the lowest N values from an array and sums them
    keep_lowest: function (keepCount: number, arr: number[]): number {
        const sorted = [...arr].sort((a, b) => a - b); // Sort ascending
        const kept = sorted.slice(0, keepCount);
        return kept.reduce((sum, val) => sum + val, 0);
    }
};

// 3. Import them securely into mathjs
math.import(customFunctions, { override: true });

// 4. The Regex Pre-processor
// Converts standard notation (2d20h) into our mathjs functions: keep_highest(1, roll_array(2, 20))
function preprocessDiceNotation(expression: string, globalMod: RollModifier = 'normal'): string {
    // Added 'v' to the allowed regex characters
    const diceRegex = /(\d+)?d(\d+)([adhlv]\d*)?/gi;

    return expression.replace(diceRegex, (match, countStr, sidesStr, modifierStr) => {
        const c = parseInt(countStr || '1', 10);
        const s = parseInt(sidesStr, 10);

        const originalMod = modifierStr ? modifierStr.charAt(0).toLowerCase() : '';
        let mod = originalMod;
        let arg = modifierStr ? parseInt(modifierStr.slice(1), 10) || 1 : 1;

        // Resolve 'v' (variable) modifier based on the passed-in global state
        if (mod === 'v') {
            if (globalMod === 'adv') mod = 'a';
            else if (globalMod === 'dis') mod = 'd';
            else mod = ''; // Fall back to normal roll if no global modifier is active
        }

        // No modifier: 3d6 -> sum(roll_array(3, 6))
        if (!mod) {
            const label = originalMod === 'v' ? `, '${c}d${s}v'` : '';
            return `sum(roll_array(${c}, ${s}${label}))`;
        }

        // Advantage: 1d20a -> max(roll_array(2, 20))
        if (mod === 'a') {
            const rolls = c === 1 ? 2 : c; // Usually adv is 2 dice, but if they type 3d20a, we respect the 3
            const label = originalMod === 'v' ? `'${c}d${s}v (Adv)'` : `'${c}d${s}a'`;
            return `max(roll_array(${rolls}, ${s}, ${label}))`;
        }
        
        // Disadvantage: 1d20d -> min(roll_array(2, 20))
        if (mod === 'd') {
            const rolls = c === 1 ? 2 : c;
            const label = originalMod === 'v' ? `'${c}d${s}v (Dis)'` : `'${c}d${s}d'`;
            return `min(roll_array(${rolls}, ${s}, ${label}))`;
        }

        // Keep Highest: 4d6h3 -> keep_highest(3, roll_array(4, 6))
        // If just 'h' (like 2d20h), arg is 1, which acts like max()
        if (mod === 'h') {
            const label = `'${c}d${s}kh${arg}'`;
            if (arg === 1) return `max(roll_array(${c}, ${s}, ${label}))`;
            return `keep_highest(${arg}, roll_array(${c}, ${s}, ${label}))`;
        }

        // Keep Lowest: 4d6l3 -> keep_lowest(3, roll_array(4, 6))
        if (mod === 'l') {
            const label = `'${c}d${s}kl${arg}'`;
            if (arg === 1) return `min(roll_array(${c}, ${s}, ${label}))`;
            return `keep_lowest(${arg}, roll_array(${c}, ${s}, ${label}))`;
        }

        return `sum(roll_array(${c}, ${s}))`;
    });
}

// 5. The Main Export
export function evaluateRoll(input: string, globalMod: RollModifier = 'normal'): RollResult {
    // Reset the log for this new evaluation
    currentRollLog = [];

    try {
        const processedExpression = preprocessDiceNotation(input, globalMod);
        
        // math.evaluate runs the secure eval on our processed string
        // We pass an empty scope {} so users can't overwrite external variables
        const total = math.evaluate(processedExpression, {});

        return {
            success: true,
            original: input,
            parsed: processedExpression,
            total: Number(total),
            breakdown: [...currentRollLog] // The raw dice that were rolled under the hood
        };
    } catch (error) {
        return {
            success: false,
            original: input,
            error: error instanceof Error ? error.message : "Invalid expression",
            total: 0,
            breakdown: []
        };
    }
}