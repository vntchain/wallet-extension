let tick = false

export const requestAnimation = realFunc => {
  const func = () => {
    realFunc()
    tick = false
    console.warn(tick) //eslint-disable-line
  }
  if (!tick) {
    window.requestAnimationFrame(func)
    tick = true
  }
}
