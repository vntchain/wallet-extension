import React from 'react'

import styles from './CommonPadding.scss'

const CommonPadding = props => {
  return (
    <div className={`${props.className || ''} ${styles['container']}`}>
      {props.children}
    </div>
  )
}

export default CommonPadding
