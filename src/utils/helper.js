export const splitLongStr = str => {
  return str ? `${str.substr(0, 6)}...${str.substr(str.length - 6, 6)}` : ''
}
