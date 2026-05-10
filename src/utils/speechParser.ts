// Maps spoken number words to numeric values
const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000,
};

// Known unit words that appear between a count and an item name
const UNIT_WORDS = new Set([
  'can', 'cans', 'jar', 'jars', 'bottle', 'bottles', 'box', 'boxes',
  'bag', 'bags', 'roll', 'rolls', 'pack', 'packs', 'package', 'packages',
  'container', 'containers', 'tube', 'tubes', 'bar', 'bars',
  'ounce', 'ounces', 'oz', 'pound', 'pounds', 'lb', 'lbs',
  'gallon', 'gallons', 'liter', 'liters', 'ml', 'quart', 'quarts',
  'piece', 'pieces', 'unit', 'units', 'count', 'item', 'items',
  'loaf', 'loaves', 'bunch', 'bunches', 'dozen', 'half',
  'feet', 'foot', 'ft', 'meter', 'meters',
  'pair', 'pairs', 'set', 'sets', 'kit', 'kits',
]);

function convertNumberWords(text: string): string {
  const words = text.trim().split(/\s+/);
  const result: (string | number)[] = [];
  let i = 0;

  while (i < words.length) {
    const word = words[i];
    const wordVal = NUMBER_WORDS[word];

    if (wordVal !== undefined) {
      let total = wordVal;

      // Handle "twenty four", "thirty five", etc.
      if (
        i + 1 < words.length &&
        NUMBER_WORDS[words[i + 1]] !== undefined &&
        NUMBER_WORDS[words[i + 1]] < 10
      ) {
        total += NUMBER_WORDS[words[i + 1]];
        i++;
      }
      result.push(total);
    } else {
      result.push(word);
    }
    i++;
  }

  return result.join(' ');
}

export interface ParsedItem {
  itemName: string;
  count: number;
  unit: string;
}

/**
 * Parses a speech transcript into a structured item.
 * Handles patterns like:
 *   "24 apples"
 *   "five cans of soup"
 *   "seventeen rolls of toilet paper"
 *   "three 8-ounce bottles of shampoo"
 */
export function parseSpeechToItem(transcript: string): ParsedItem | null {
  const normalized = convertNumberWords(transcript.toLowerCase().trim());

  // Pattern 1: NUMBER UNIT [of] ITEM_NAME
  // e.g. "5 cans of soup", "17 rolls toilet paper"
  const match1 = normalized.match(/^(\d+(?:\.\d+)?)\s+(\S+)\s+(?:of\s+)?([\w\s]+)$/);
  if (match1) {
    const count = parseFloat(match1[1]);
    const possibleUnit = match1[2];
    const rest = match1[3].trim();

    if (UNIT_WORDS.has(possibleUnit)) {
      return { count, unit: possibleUnit, itemName: rest };
    }
    // Second word is not a known unit — treat everything as item name
    return { count, unit: 'count', itemName: `${possibleUnit} ${rest}`.trim() };
  }

  // Pattern 2: NUMBER ITEM_NAME (no unit)
  // e.g. "24 apples", "6 toothbrushes"
  const match2 = normalized.match(/^(\d+(?:\.\d+)?)\s+([\w\s]+)$/);
  if (match2) {
    const count = parseFloat(match2[1]);
    const itemName = match2[2].trim();
    return { count, unit: 'count', itemName };
  }

  return null;
}

/**
 * Parses multiple items from a single transcript.
 * Handles comma/and-separated utterances like:
 *   "24 apples, 5 cans of soup, and 17 rolls of toilet paper"
 */
export function parseSpeechToItems(transcript: string): ParsedItem[] {
  const segments = transcript.split(/,|\band\b/i).map(s => s.trim()).filter(Boolean);
  const results: ParsedItem[] = [];

  for (const segment of segments) {
    const parsed = parseSpeechToItem(segment);
    if (parsed) results.push(parsed);
  }

  return results;
}
