const calculateColorSingle = (o, b, f) => Math.round((1 - o) * b + o * f)

export const calculateColorArray = (o, b, f) =>
    f.map((c, i) => {
        const r = calculateColorSingle(o, b[i], c)
        return isNaN(r) ? 0 : r
    })

export const calculateOpacity = (b, f, r) => {
    const o = Math.max(Math.min((b - r) / (b - f), 1), 0)
    return isNaN(o) ? 0 : o
}

export const useDecimal = value =>
    Number.isInteger(value) ? value : value.toFixed(2)
