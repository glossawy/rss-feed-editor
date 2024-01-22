type Reduce<T> = Pick<T[], "reduce">
type Mappable<T> = Pick<T[], "map">
type Filterable<T> = Pick<T[], "filter">

export default {
  max<T>(xs: Reduce<T>): T {
    return xs.reduce((a, e) => (e > a ? e : a))
  },
  placeAt<T>(elem: T, xs: Mappable<T>, idx: number) {
    return xs.map((x, i) => (i === idx ? elem : x))
  },
  removeAt<T>(xs: Filterable<T>, idx: number) {
    return xs.filter((_x, i) => idx !== i)
  },
  shiftItemLeftAt<T>(xs: T[], idx: number): T[] {
    if (idx === 0) {
      return xs
    } else {
      const dstIdx = idx - 1
      return [...xs.slice(0, dstIdx), xs[idx], xs[dstIdx], ...xs.slice(idx + 1)]
    }
  },
  shiftItemLeft<T>(xs: T[], pred: (x: T) => boolean): T[] {
    const idx = xs.findIndex(pred)
    return this.shiftItemLeftAt(xs, idx)
  },
  shiftItemRightAt<T>(xs: T[], idx: number): T[] {
    if (idx === xs.length - 1) {
      return xs
    } else {
      const dstIdx = idx + 1
      return [...xs.slice(0, idx), xs[dstIdx], xs[idx], ...xs.slice(dstIdx + 1)]
    }
  },
  shiftItemRight<T>(xs: T[], pred: (x: T) => boolean): T[] {
    const idx = xs.findIndex(pred)
    return this.shiftItemRightAt(xs, idx)
  },
}
