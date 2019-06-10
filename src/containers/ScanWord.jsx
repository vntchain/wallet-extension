import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import styles from './ScanWord.scss'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import BaseWarn from '../component/layout/BaseWarn'
import Copier from '../component/Copier'
import PasswordForm from './home/PasswordForm'
import BaseTip from '../component/layout/BaseTip'
import { Button } from 'antd-mobile'

const ScanWord = function(props) {
  const copyRef = React.createRef()
  const {
    user: { addr },
    word: { word, hasGetWord },
    history,
    dispatch
  } = props
  useEffect(() => {
    //关闭窗口时重置状态，下次打开需重新输入密码获取
    return () => {
      dispatch({
        type: 'word/setHasGetWord',
        payload: false
      })
    }
  }, [])
  const handleBack = () => {
    history.goBack()
  }
  const handleFetchWord = () => {
    dispatch({
      type: '',
      payload: { addr }
    })
  }
  return (
    <Fragment>
      <Header title={'查看助记词'} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <BaseWarn warns={['不要对任何人展示助记词！']} />
          {hasGetWord ? (
            <Fragment>
              <div className={styles.cont}>
                {word.map(item => (
                  <Fragment key={item}>{`${item} `}</Fragment>
                ))}
              </div>
              <Copier text={word} copyRef={copyRef}>
                <a className={styles.copy} href="javascript:">
                  复制到剪贴板
                </a>
              </Copier>
              <BaseTip
                tips={[
                  '重要提示：',
                  '助记词用于恢复您的钱包，按照顺序将它抄写下来，并存放在安全的地方！',
                  '如果您不慎将助记词遗忘，那么钱包中的资产将无法挽回。'
                ]}
              />
              <Button type="primary" onClick={handleBack}>
                关闭
              </Button>
            </Fragment>
          ) : (
            <PasswordForm onCancel={handleBack} onOk={handleFetchWord} />
          )}
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default withRouter(
  connect(({ user, word }) => ({
    user,
    word
  }))(ScanWord)
)
