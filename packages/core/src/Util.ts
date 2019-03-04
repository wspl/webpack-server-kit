export function setDefault (obj, key: string, value) {
  if (obj[key] === undefined) {
    obj[key] = value
  }
}
