/**
 * Generate a random [minValue, maxValue) color value to be used for rgb components
 */
const randomColorComponent = (minValue: number, maxValue: number): number => {
  return Math.floor(minValue + Math.random() * (maxValue - minValue));
};

/**
 * Generate a random hexcode color
 */
export const randomHexcode = (minValue: number, maxValue: number): string => {
  let _maxValue = maxValue;

  const color = () => {
    const value = randomColorComponent(minValue, _maxValue);

    _maxValue = Math.min(maxValue, maxValue - value);

    const hex = value.toString(16);

    if (hex.length === 2) {
      return hex;
    }

    return `0${hex}`;
  };

  const first = Math.floor(Math.random() * 3);

  const colors = ['', '', ''];

  for (let i = first; i < first + 3; i++) {
    colors[i % 3] = color();
  }

  return `#${colors[0]}${colors[1]}${colors[2]}`;
};
