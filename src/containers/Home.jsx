import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import styles from './Home.scss'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import UserDetail from './home/UserDetail'
import ExportKeystone from './home/ExportKeystone'
import { splitLongStr, calBigMulti } from '../utils/helper'
import imgs from '../utils/imgs'
import paths from '../utils/paths'
import { netUrlList } from '../constants/net'

const Home = function(props) {
  const {
    user: {
      addr,
      currTrade,
      accountBalance,
      envObj: { chainId }
    },
    price: { vntToCny },
    dispatch,
    history
  } = props
  const [userVisible, setUserVisible] = useState(false)
  const [keystoneVisible, setKeystoneVisible] = useState(false)
  useEffect(() => {
    dispatch({
      type: 'user/getAccounts'
    })
  }, [])
  useEffect(() => {
    if (addr) {
      dispatch({
        type: 'user/getAccountBalance',
        payload: { addr }
      })
    }
  }, [addr])
  useEffect(() => {
    //根据环境变化重新获取交易列表
    dispatch({
      type: 'user/filterCurrentTrade'
    })
    if (addr) {
      //根据环境变化重新获取余额
      dispatch({
        type: 'user/getAccountBalance',
        payload: { addr }
      })
    }
  }, [chainId])
  const handleOpenSend = () => {
    dispatch({
      type: 'send/clearTx'
    })
    history.push(paths.send)
  }
  const handleLink = id => {
    window.open(`${netUrlList[chainId]}/transaction/${id}`)
  }

  return (
    <Fragment>
      <Header title={'首页'} theme={'trans'} hasSetting={true} />
      <div className={styles.banner}>
        <CommonPadding>
          <div className={styles.user}>
            <div>
              <img src={imgs.user} alt="user" />
              <span className={styles.code}>{splitLongStr(addr)}</span>
            </div>
            <a
              href="javascript:"
              className={styles.btn}
              onClick={() => setUserVisible(true)}
            >
              详情
            </a>
          </div>
          <div className={styles.vnt}>{`${accountBalance} VNT`}</div>
          <div className={styles.currency}>
            {`￥ ${calBigMulti(accountBalance, vntToCny)}`}
          </div>
          <div className={styles.tx}>
            <a
              href="javascript:"
              className={styles['tx-btn']}
              onClick={() => setUserVisible(true)}
            >
              <img src={imgs.rollIn} alt="转入" />
              转入
            </a>
            <a
              href="javascript:"
              className={styles['tx-btn']}
              onClick={() => handleOpenSend()}
            >
              <img src={imgs.rollOut} alt="转出" />
              转出
            </a>
          </div>
        </CommonPadding>
      </div>
      <div className={styles.container}>
        <CommonPadding>
          <h2 className={styles.title}>交易历史</h2>
          <div className={styles.history}>
            {currTrade.length ? (
              currTrade.map((item, index) => (
                <ul className={styles['history-item']} key={index}>
                  <li>
                    <span className={styles.date}>{item.time}</span>
                    <a href="javascript:" onClick={() => handleLink(item.id)}>
                      去浏览器查看
                    </a>
                  </li>
                  <li>
                    <span className={styles.txid}>
                      交易id
                      <span
                        className={`${styles.status} ${styles[item.state]}`}
                      >
                        {item.state}
                      </span>
                    </span>
                    <span className={styles.vnt}>{`${
                      item.value == 0 ? item.value : '-' + item.value
                    } VNT`}</span>
                  </li>
                  <li>
                    <Link to={`/detail/${item.id}`} className={styles.code}>
                      {splitLongStr(item.id)}
                    </Link>
                    <span className={styles.currency}>
                      {`￥ ${calBigMulti(item.value, vntToCny)}`}
                    </span>
                  </li>
                </ul>
              ))
            ) : (
              <span>暂无交易</span>
            )}
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

export default withRouter(
  connect(({ user, home, price }) => ({
    user,
    home,
    price
  }))(Home)
)
