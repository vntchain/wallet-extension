import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import paths from '../../utils/paths'
import imgs from '../../utils/imgs'
import { splitLongStr, formatDecimal } from '../../utils/helper'
import { netList } from '../../constants/net'
import styles from './Setting.scss'
import { message } from 'antd'
import { LangConsumer, FormattedMessage, localText } from '../../i18n'
const Setting = function(props) {
  const {
    user: { addr, accounts, envObj },
    international: { language },
    history,
    dispatch
  } = props
  const [isSetShow, setIsSetShow] = useState(false)
  useEffect(() => {
    if (isSetShow) {
      dispatch({
        type: 'user/getAccountBalanceAll'
      })
    }
  }, [isSetShow])
  const showDisplay = () => {
    return isSetShow ? 'block' : 'none'
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
    setIsSetShow(false)
  }
  const handleScan = () => {
    const curAccount = accounts.find(item => item.addr == addr)
    // console.warn(curAccount) //eslint-disable-line
    if (curAccount.type) {
      message.error(localText[language]['set_errMsg'])
      return
    }
    linkTo(paths.scanWord)
  }
  const LinkList = {
    zh: [
      {
        创建新地址: createNewAddr,
        导入地址: () => linkTo(paths.importKeystone)
      },
      {
        中文: 'zh',
        English: 'en'
      },
      {
        关于我们: () => linkTo(paths.about),
        服务条款: () => linkTo(paths.law)
      },
      {
        查看助记词: handleScan,
        登出钱包: loginOut
      }
    ],
    en: [
      {
        'Create new address': createNewAddr,
        'Import address': () => linkTo(paths.importKeystone)
      },
      {
        中文: 'zh',
        English: 'en'
      },
      {
        'About us': () => linkTo(paths.about),
        'Terms of Service': () => linkTo(paths.law)
      },
      {
        'View mnemonic words': handleScan,
        'Sign out of wallet': loginOut
      }
    ]
  }
  const handleChangeEnv = id => {
    if (id !== envObj.chainId) {
      dispatch({
        type: 'user/setProviderUrl',
        payload: {
          newprovider: id
        }
      })
      setIsSetShow(false)
    }
  }
  const handleChangeWallet = currAddr => {
    if (addr !== currAddr) {
      dispatch({
        type: 'user/setUserAddr',
        payload: { addr: currAddr }
      })
      setIsSetShow(false)
    }
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
          {netList[language].map((item, index) => {
            return item ? (
              <div
                className={`${styles['setting-item']} ${
                  envObj.chainId === index ? styles['setting-item_active'] : ''
                }`}
                key={index}
                onClick={() => handleChangeEnv(index)}
              >
                {item}
              </div>
            ) : (
              ''
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
                    <span
                      className={
                        language === 'zh' ? styles.import : styles.import_en
                      }
                    >
                      <FormattedMessage id="set_import" />
                    </span>
                  ) : (
                    ''
                  )}
                </p>
                <p className={styles.vnt}>
                  {item.vnt ? `${formatDecimal(item.vnt, 8)} VNT` : '--'}
                </p>
              </div>
            )
          })}
        </div>
        {LinkList[language].map((obj, index) =>
          index !== 1 ? (
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
          ) : (
            <LangConsumer key={language}>
              {({ lang }) => (
                <div className={styles['setting-list']} key={index}>
                  {Object.keys(obj).map(item => (
                    <div
                      className={`${styles['setting-item']} ${
                        obj[item] === lang ? styles['setting-item_active'] : ''
                      }`}
                      key={item}
                      onClick={() => {
                        dispatch({
                          type: 'international/setLanguage',
                          payload: obj[item]
                        })
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </LangConsumer>
          )
        )}
      </div>
    </div>
  )
}

export default withRouter(
  connect(({ user, international }) => ({
    user,
    international
  }))(Setting)
)
