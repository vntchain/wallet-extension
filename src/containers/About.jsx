import React from 'react'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import imgs from '../utils/imgs'
import { connect } from 'react-redux'
import { FormattedMessage } from '../i18n'

import styles from './About.scss'

const About = function(props) {
  const {
    international: { language }
  } = props
  return (
    <div className={styles.about}>
      <Header
        title={<FormattedMessage id="about_Header_title" />}
        hasBack={true}
      />
      <div className={styles.container}>
        <CommonPadding>
          <div className={styles.block}>
            <div className={styles.title}>
              <h3>
                <FormattedMessage id="about_title" />
              </h3>
              <span className={styles.version}>
                <FormattedMessage id="about_version" />
              </span>
            </div>
            <p className={styles.copyright}>
              <FormattedMessage id="about_copyright" />
            </p>
            <div className={styles.logo}>
              <img src={imgs.logo} alt="logo" />
            </div>
          </div>
          <div className={styles.block}>
            <h3>
              <FormattedMessage id="about_link" />
            </h3>
            <a
              href="javascript:"
              onClick={() => {
                window.open('https://hubscan.vnt.link/')
              }}
              className={styles.link}
            >
              <FormattedMessage id="about_vnt_browser" />
            </a>
            <a
              href="javascript:"
              onClick={() => {
                window.open(`http://vntchain.io/?language=${language}`)
              }}
              className={styles.link}
            >
              <FormattedMessage id="about_vnt_address" />
            </a>
          </div>
          <div className={styles.block}>
            <h3>
              <FormattedMessage id="about_us" />
            </h3>
            <div className={styles.qrcode}>
              <img src={imgs.qrcode} alt="qrcode" />
              <FormattedMessage id="about_vx" />
            </div>
          </div>
        </CommonPadding>
      </div>
    </div>
  )
}

export default connect(({ international }) => ({ international }))(About)
