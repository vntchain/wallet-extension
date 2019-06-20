import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { message } from 'antd'

const Copier = React.forwardRef((props, ref) => {
  const { text } = props
  const handleCopy = () => {
    ref.current.select()
    document.execCommand('copy')
    message.info('复制成功！')
  }
  return (
    <Fragment>
      <input
        type="text"
        style={{
          position: 'absolute',
          right: '-4000rem',
          color: 'transparent',
          display: 'none',
          visibility: 'hidden'
        }}
        value={text}
        readOnly
        ref={ref}
      />
      <span onClick={handleCopy}>{props.children}</span>
    </Fragment>
  )
})

Copier.propType = {
  text: PropTypes.string.isRequired,
  ref: PropTypes.object.isRequired
}

export default Copier
