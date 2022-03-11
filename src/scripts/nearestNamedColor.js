import namedColors from '../data/named-colors.json';

const distance = ([r1, g1, b1], [r2, g2, b2]) => Math.sqrt((r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2);

export const nearestNamedColor = (color) => {
    const namedColor = namedColors.reduce((r, c) => {
        const currentDistance = distance(color, c.rgb.array);
        if (currentDistance < r[1]) {
            return [c.name, currentDistance];
        }
        return r;
    }, [undefined, 1000]);
    return namedColor[0];
};
