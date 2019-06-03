import { useState, useEffect } from 'react'
import { connect } from 'react-redux'

const responsiveWidth = [768, 1200]

// For now we just check whether the width is smaller then 768px or not. In a word,
// this only supports 2 components switching.
// See ResponsiveSwitch.jsx
function getResponsiveWidth(width) {
  for (const w of responsiveWidth) {
    if (width <= w) {
      return w
    }
  }
  return 0
}

const InnerWidthWatcher = props => {
  // const { width } = props.window
  // const path = window.location.pathname
  const [w, setW] = useState(null)

  function handleChangeWidth() {
    const clientWidth = Math.min(
      window.innerWidth,
      document.documentElement.clientWidth
    )
    const wi = getResponsiveWidth(clientWidth)
    setW(wi)
  }

  useEffect(() => {
    handleChangeWidth()
    window.addEventListener('resize', handleChangeWidth)
    return () => {
      window.removeEventListener('resize', handleChangeWidth)
    }
  }, [])
  useEffect(
    () => {
      if (w !== null) {
        props.dispatch({
          type: 'window/setWidth',
          payload: w
        })
      }
    },
    [w]
  )
  return props.children
}

function mapStateToProps({ window, news }) {
  return { window, news }
}

export default connect(mapStateToProps)(InnerWidthWatcher)
