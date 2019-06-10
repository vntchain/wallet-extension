import React from 'react'
import PropTypes from 'prop-types'

const Downloader = props => {
  const { content, fileName, type = 'json' } = props
  let blobCont
  if (type === 'json') {
    blobCont = JSON.stringify(content)
  }
  const blob = new Blob([blobCont], { type: 'text/plain;charset=utf-8' })
  return (
    <a href={URL.createObjectURL(blob)} download={fileName}>
      {props.children}
    </a>
  )
}

Downloader.propType = {
  content: PropTypes.object.required, //json对象
  fileName: PropTypes.string.required
}

export default Downloader
