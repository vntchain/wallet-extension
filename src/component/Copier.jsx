import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { message } from 'antd'
// import { connect } from 'react-redux'
import { localText } from '../i18n'
const Copier = React.forwardRef((props, ref) => {
  const { text, language } = props
  const handleCopy = () => {
    ref.current.select()
    document.execCommand('copy')
    message.info(localText[language]['Copier_message'])
  }
  return (
    <Fragment>
      <input
        type="text"
        style={{
          position: 'absolute',
          right: '-4000px',
          color: 'transparent'
        }}
        value={text}
        readOnly
        ref={ref}
        onChange={() => {}}
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
