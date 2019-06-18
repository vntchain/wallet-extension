import React, { Fragment } from 'react'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import laws from '../constants/laws'

import styles from './Law.scss'

const About = function() {
  return (
    <div className={styles.about}>
      <Header title={'VNT钱包用户条款'} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <div className={styles.law}>
            {laws.map((item, index) => {
              if (index === 0) {
                return (
                  <Fragment>
                    <h2>{item.title}</h2>
                    <p>{item.cont}</p>
                  </Fragment>
                )
              } else {
                return (
                  <section>
                    <h3>{item.title}</h3>
                    <p>{item.cont}</p>
                  </section>
                )
              }
            })}
          </div>
        </CommonPadding>
      </div>
    </div>
  )
}

export default About
