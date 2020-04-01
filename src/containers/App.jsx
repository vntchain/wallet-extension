import React, { useEffect, Fragment } from 'react'
import { Route, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
// import PropTypes from 'prop-types'
import requireAuth from '../component/requireAuth'
import paths from '../utils/paths'

import Login from './Login'
import Wallet from './Wallet'
import Home from './Home'
import ScanWord from './ScanWord'
import About from './About'
import ImportKeystone from './ImportKeystone'
import Send from './Send'
import Commission from './Commission'
import TxDetail from './TxDetail'
import OuterAuth from './OuterAuth'
import OuterSend from './OuterSend'
import Law from './Law'
import { LangProvider } from '../i18n'
const App = function(props) {
  const {
    dispatch,
    international: { language }
  } = props

  useEffect(() => {
    //获取主网环境
    dispatch({
      type: 'user/getProviderUrl'
    })
    //获取地址-已登录状态初始化
    dispatch({
      type: 'user/getAddr'
    })
    //获取vnttocny
    dispatch({
      type: 'price/getVntToCny'
    })
    // 获取当前 tab 页的url

    global.chrome.windows.getCurrent(currentWindow => {
      global.chrome.tabs.query({ active: true, highlighted: true }, function(
        tab
      ) {
        const current = tab.find(item => item.windowId === currentWindow.id)

        if (currentWindow.type !== 'popup') {
          // 打开方式为 直接打开钱包
          dispatch({
            type: 'international/setLang',
            payload: current.url
          })
        } else {
          // 打开方式 为在入口处打开
          // 从入口  打开的钱包窗口的url 带有 上一个焦点窗口的Id 值 通过这个Id 值去 筛选入口页面 确定语言

          const windowId = current.url.split('?windowId=')[1]

          const targetTab = tab.find(
            item => item.windowId === parseInt(windowId)
          )

          dispatch({
            type: 'international/setLang',
            payload: targetTab.url
          })
        }
      })
    })
    //交易状态变化更新账户列表->更新交易列表->更新账户余额
    global.chrome.runtime.onMessage.addListener(function(request) {
      if (request.type === 'trx_state_changed') {
        dispatch({
          type: 'user/getAccounts'
        })
        dispatch({
          type: 'user/getAccountBalance'
        })
      }
    })

    //根据窗口打开类型修改宽度高度
    global.chrome.windows.getCurrent(obj => {
      if (obj.type === 'popup') {
        window.document.body.style.width = '100%'
        window.document.body.style.height = '100%'
        window.document.body.parentElement.style.height = '100%'
      }
    })
  }, [])
  return (
    <LangProvider lang={language}>
      <Fragment>
        <Route exact path={paths.login} component={Login} />
        <Route exact path={paths.home} component={requireAuth(Home)} />
        <Route exact path={paths.scanWord} component={requireAuth(ScanWord)} />
        <Route exact path={paths.about} component={About} />
        <Route exact path={paths.law} component={Law} />
        <Route
          exact
          path={paths.importKeystone}
          component={requireAuth(ImportKeystone)}
        />
        <Route exact path={paths.send} component={requireAuth(Send)} />
        <Route
          exact
          path={paths.commission}
          component={requireAuth(Commission)}
        />
        <Route
          exact
          path={`${paths.txDetail}/:id`}
          component={requireAuth(TxDetail)}
        />
        <Route
          exact
          path={paths.outerAuth}
          component={requireAuth(OuterAuth)}
        />
        <Route
          exact
          path={paths.outerSend}
          component={requireAuth(OuterSend)}
        />
        <Route path={paths.wallet} component={Wallet} />
        {/* <Redirect to="/" /> */}
      </Fragment>
    </LangProvider>
  )
}

// App.propTypes = {
//   international: PropTypes.object
// }

export default withRouter(
  connect(({ international }) => ({ international }))(App)
)
