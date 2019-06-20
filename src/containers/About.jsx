import React from 'react'
import { Link } from 'react-router-dom'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import imgs from '../utils/imgs'

import styles from './About.scss'

const About = function() {
  return (
    <div className={styles.about}>
      <Header title={'关于我们'} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <div className={styles.block}>
            <div className={styles.title}>
              <h3>VNT钱包插件</h3>
              <span className={styles.version}>v1.0.0</span>
            </div>
            <p className={styles.copyright}>
              {`Copyright ©️ VNT Chain 2018 All Rights Reserved.`}
            </p>
            <div className={styles.logo}>
              <img src={imgs.logo} alt="logo" />
            </div>
          </div>
          <div className={styles.block}>
            <h3>链接</h3>
            <a
              href="javascript:"
              onClick={() => {
                window.open('https://hubscan.vnt.link/')
              }}
              className={styles.link}
            >
              VNT 区块链浏览器
            </a>
            <Link
              href="javascript:"
              onClick={() => {
                window.open('http://vntchain.io/')
              }}
              className={styles.link}
            >
              VNT 官方网站
            </Link>
          </div>
          <div className={styles.block}>
            <h3>联系我们</h3>
            <div className={styles.qrcode}>
              <img src={imgs.qrcode} alt="qrcode" />
              <span>微信公众号</span>
            </div>
          </div>
        </CommonPadding>
      </div>
    </div>
  )
}

export default About
