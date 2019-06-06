import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { message } from 'antd'

const Copier = props => {
  const { text, copyRef } = props
  const handleCopy = () => {
    copyRef.current.select()
    document.execCommand('copy')
    message.info('复制成功！')
  }
  console.log(props.children) //eslint-disable-line
  return (
    <Fragment>
      <input
        type="text"
        style={{
          position: 'absolute',
          right: '-4000rem',
          color: 'transparent'
        }}
        value={text}
        readOnly
        ref={copyRef}
      />
      <span onClick={handleCopy}>{props.children}</span>
    </Fragment>
  )
}

Copier.propType = {
  text: PropTypes.string.isRequired,
  copyRef: PropTypes.isRequired
}

export default Copier
