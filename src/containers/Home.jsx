import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import styles from './Home.scss'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import UserDetail from './home/UserDetail'
import ExportKeystone from './home/ExportKeystone'
import imgs from '../utils/imgs'

const Home = function(props) {
  const {
    user: { addr }
  } = props
  const [userVisible, setUserVisible] = useState(false)
  const [keystoneVisible, setKeystoneVisible] = useState(false)
  useEffect(() => {
      console.log(addr) //eslint-disable-line
  }, [addr])
  return (
    <Fragment>
      <Header title={'首页'} theme={'trans'} hasSetting={true} />
      <div className={styles.banner}>
        <CommonPadding>
          <div className={styles.user}>
            <div>
              <img src={imgs.user} alt="user" />
              <span className={styles.code}>{'111111'}</span>
            </div>
            <a
              href="javascript:"
              className={styles.btn}
              onClick={() => setUserVisible(true)}
            >
              详情
            </a>
          </div>
          <div className={styles.vnt}>{`${'111'} VNT`}</div>
          <div className={styles.currency}>{`￥ ${'2222'}`}</div>
          <div className={styles.tx}>
            <a href="javascript:" className={styles['tx-btn']}>
              <img src={imgs.rollIn} alt="转入" />
              转入
            </a>
            <Link to="/" href="javascript:" className={styles['tx-btn']}>
              <img src={imgs.rollOut} alt="转出" />
              转出
            </Link>
          </div>
        </CommonPadding>
      </div>
      <div className={styles.container}>
        <CommonPadding>
          <h2 className={styles.title}>交易历史</h2>
          <div className={styles.history}>
            <ul className={styles['history-item']}>
              <li>
                <span className={styles.date}>2019/4/1</span>
                <Link to={'/'}>去浏览器查看</Link>
              </li>
              <li>
                <span className={styles.txid}>交易id</span>
                <span className={styles.vnt}>{`-1323 VNT`}</span>
              </li>
              <li>
                <span className={styles.code}>{`12313`}</span>
                <span className={styles.currency}>{`￥ 12132`}</span>
              </li>
            </ul>
          </div>
        </CommonPadding>
      </div>
      <UserDetail
        visible={userVisible}
        onClose={() => setUserVisible(false)}
        openKeystone={() => setKeystoneVisible(true)}
      />
      <ExportKeystone
        visible={keystoneVisible}
        onClose={() => setKeystoneVisible(false)}
      />
    </Fragment>
  )
}

export default connect(({ user }) => ({
  user
}))(Home)
