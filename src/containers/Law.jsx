import React from 'react'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'

import styles from './Law.scss'

const About = function() {
  return (
    <div className={styles.about}>
      <Header title={'VNT钱包用户条款'} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <div className={styles.law}>{'111'}</div>
        </CommonPadding>
      </div>
    </div>
  )
}

export default About
