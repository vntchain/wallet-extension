import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const Downloader = props => {
  const { content, fileName, isDownload, handleFetch } = props
  const [blob, setBlob] = useState(null)
  // const blob = isDownload
  //   ? new Blob([content], { type: 'text/plain;charset=utf-8' })
  //   : null
  const handleOnClick = () => {
    console.log('11111') //eslint-disable-line
  }
  useEffect(() => {
    if (isDownload) {
      setBlob(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    }
  }, [isDownload])
  return blob ? (
    <a
      href={URL.createObjectURL(blob)}
      download={fileName}
      onClick={handleOnClick}
    >
      {props.children}
    </a>
  ) : (
    <span onClick={handleFetch}>{props.children}</span>
  )
}

Downloader.propType = {
  content: PropTypes.string.required, //文件主体
  fileName: PropTypes.string.required, //文件名
  isDownload: PropTypes.bool.required //是否可以下载 = 是否已经获取到要下载的数据
}

export default Downloader
