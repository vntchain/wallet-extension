import { useEffect } from 'react'
import { withRouter } from 'react-router-dom'

export default withRouter(function ScrollToTop({ children, location }) {
  const pathname = location.pathname
  useEffect(() => {
    window.document.body.scrollTo(0, 0)
  }, [pathname])
  return children
})
