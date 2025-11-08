/**
 * CONCRETE EXAMPLE: createRNG("test")
 * 
 * STEP 1: hashString("test") converts string to number
 *   - 't'=116, 'e'=101, 's'=115, 't'=116
 *   - hash = 0 → 116 → 3697 → 114722 → 3556498
 *   - Final: state = 3556498
 * 
 * STEP 2: First call to random()
 *   - state = 3556498
 *   - state = (3556498 + 0x6D2B69F5) | 0
 *     → state = (3556498 + 1831565813) | 0 = 1835122311
 *   
 *   - state >>> 15 = 1835122311 >>> 15 = 56000
 *   - state ^ (state >>> 15) = 1835122311 ^ 56000 = 1835066311
 *   - state | 1 = 1835122311 (already odd)
 *   - t = Math.imul(1835066311, 1835122311) = 336593... (large number)
 *   
 *   - t >>> 7 = (shifted value)
 *   - t ^ (t >>> 7) = (mixed value)
 *   - t = t ^ (t + Math.imul(...)) = (further mixed)
 *   
 *   - Final: t ^ (t >>> 14) = (final mixed value)
 *   - Return: ((final) >>> 0) / 4294967296 = 0.42... (example: 0.423456789)
 * 
 * STEP 3: Second call to random()
 *   - state is now modified from previous call
 *   - Same process, but state has changed → different result
 *   - Return: 0.87... (example: 0.876543210)
 * 
 * Same seed = same sequence every time!
 */

/**
 * Converts a string seed into a number
 * @param str string seed
 * @returns a non-negative number
 */
function hashString(str: string): number {
    let hash = 0;
    // iterate over each character
    for (let i = 0; i < str.length; i++) {
        // gets the numberic code for the current character
        const char = str.charCodeAt(i)
        // hash << 5 shifts left by 5 bits ( multiply by 32 ) - hash + char
        // this is to mix the character code into the hash
        hash = ((hash << 5) - hash) + char;
        // Force a 32-bit integer
        hash = hash | 0
    }
    // Return a non-negative number
    return Math.abs(hash)
}

/**
 * Converst the seed string into a number and stores it as internal state
 * @param seed seed string
 * @returns a function that generates the next random number
 */
export function createRNG(seed: string) {
    let state = hashString(seed);

    return function random() {
        // Adding a constant to the state
        // 0 forces a 32-bit signed integer
        state = (state + 0x6D2B69F5) | 0;
        // state >>> 15 shifts right by 15 bits
        // state ^ (state >>> 15) XORs the state with its shifted version
        // XOR is a bitwise operation that compares the two bits for example 1010 and 1100
        // and outputs 1 for every differing number. in this case 0110. Done this in class.
        // state | 1 ensures the value is odd
        // Math.imul multiplies two 32-bit integers and returns a 32-bit result
        let t = Math.imul(state ^ (state >>> 15), state | 1);
        // Another mixing step for better distribution
        t = t ^ (t + Math.imul(t ^ (t >>> 7), state | 61));
        // t ^ (t >>> 14) is the final mixing 
        // >>> 0 converts to an unsigned 32-bit integer
        // dividing by 4294967296 to get a value in [0, 1).
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

/**
 * Type alias for a seeded random number generator function.
 * Returns a value in the range [0, 1).
 */
export type RNG = () => number;

/**
 * Generates a random integer between min and max (inclusive).
 * Uses the provided RNG function to ensure deterministic results.
 * 
 * @param rng - The seeded RNG function that returns a value in [0, 1)
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A random integer between min and max (inclusive)
 * 
 * @example
 * const rng = createRNG("seed-123");
 * randomInt(rng, 1, 6); // Returns 1, 2, 3, 4, 5, or 6 (like rolling a die)
 * randomInt(rng, 10, 20); // Returns an integer between 10 and 20
 */
export function randomInt(rng: RNG, min: number, max: number): number {
    // Returns integer between min and max (inclusive)
    return Math.floor(rng() * (max - min + 1)) + min;
  }
  
/**
 * Generates a random float between min and max (inclusive of min, exclusive of max).
 * Uses the provided RNG function to ensure deterministic results.
 * 
 * @param rng - The seeded RNG function that returns a value in [0, 1)
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (exclusive)
 * @returns A random float between min (inclusive) and max (exclusive)
 * 
 * @example
 * const rng = createRNG("seed-123");
 * randomFloat(rng, 0, 1); // Returns a float in [0, 1)
 * randomFloat(rng, 10.5, 20.5); // Returns a float in [10.5, 20.5)
 * randomFloat(rng, -5, 5); // Returns a float in [-5, 5)
 */
export function randomFloat(rng: RNG, min: number, max: number): number {
    // Returns float between min (inclusive) and max (exclusive)
    // rng() returns [0, 1), so result is in [min, max)
    return rng() * (max - min) + min;
  }