import React, { useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import paths from '../../utils/paths'
import imgs from '../../utils/imgs'
import { splitLongStr } from '../../utils/helper'
import styles from './Setting.scss'

const Setting = function(props) {
  const {
    user: { addr, accounts },
    env,
    history,
    dispatch
  } = props
  const [isSetShow, setIsSetShow] = useState(false)
  const showDisplay = () => {
    return isSetShow ? 'block' : 'none'
  }
  const enviromentList = {
    maintain: '主网',
    test: '测试网'
  }
  const linkTo = link => {
    history.push(link)
  }
  const loginOut = () => {
    dispatch({
      type: 'user/logout'
    })
  }
  const createNewAddr = () => {
    dispatch({
      type: 'user/addNewAccount'
    })
  }
  const LinkList = [
    {
      创建新地址: () => createNewAddr(),
      导入地址: () => linkTo(paths.importKeystone)
    },
    {
      关于我们: () => linkTo(paths.about),
      服务条款: () => linkTo(paths.services)
    },
    {
      查看助记词: () => linkTo(paths.word),
      登出钱包: () => loginOut()
    }
  ]
  const handleChangeEnv = () => {}
  const handleChangeWallet = currAddr => {
    dispatch({
      type: 'user/setUserAddr',
      payload: currAddr
    })
    setIsSetShow(false)
  }
  return (
    <div className={styles.setting}>
      <img
        className={styles.icon}
        src={imgs.set}
        alt="set"
        onClick={() => setIsSetShow(!isSetShow)}
      />
      <div
        className={styles['setting-bg']}
        style={{ display: showDisplay() }}
        onClick={() => setIsSetShow(false)}
      />
      <div
        className={styles['setting-cont']}
        style={{ display: showDisplay() }}
      >
        <div className={styles['setting-list']}>
          {Object.keys(enviromentList).map(item => {
            return (
              <div
                className={`${styles['setting-item']} ${
                  env === item ? styles['setting-item_active'] : ''
                }`}
                key={item}
                onClick={() => handleChangeEnv}
              >
                {enviromentList[item]}
              </div>
            )
          })}
        </div>
        <div className={styles['setting-list']}>
          {accounts.map(item => {
            return (
              <div
                className={`${styles['setting-item']} ${
                  addr === item.addr ? styles['setting-item_active'] : ''
                }`}
                key={item.addr}
                onClick={() => handleChangeWallet(item.addr)}
              >
                <p>
                  <span>{splitLongStr(item.addr)}</span>
                  {item.type ? (
                    <span className={styles.import}>外部导入</span>
                  ) : (
                    ''
                  )}
                </p>
                <p className={styles.vnt}>
                  {item.vnt ? `${item.vnt} VNT` : '--'}
                </p>
              </div>
            )
          })}
        </div>
        {LinkList.map((obj, index) => (
          <div className={styles['setting-list']} key={index}>
            {Object.keys(obj).map(item => (
              <a
                className={`${styles['setting-item']}`}
                key={item}
                onClick={obj[item]}
              >
                {item}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default withRouter(
  connect(({ user }) => ({
    user,
    env: 'maintain'
  }))(Setting)
)
