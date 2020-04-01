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
import { FormattedMessage, localText } from '../i18n'

const ScanWord = function(props) {
  const copyRef = React.createRef()
  const {
    user: { addr },
    word: { word, hasGetWord },
    international: { language },
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
  const handleFetchWord = values => {
    const { password: passwd } = values
    dispatch({
      type: 'word/fetchWord',
      payload: { addr, passwd }
    })
  }
  return (
    <Fragment>
      <Header title={<FormattedMessage id="scanWord_title" />} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <BaseWarn warns={[localText[language]['scanWord_warn']]} />
          {hasGetWord ? (
            <Fragment>
              <div className={styles.cont}>{word}</div>
              <Copier text={word} language={language} ref={copyRef}>
                <a className={styles.copy} href="javascript:">
                  <FormattedMessage id="scanWord_copy" />
                </a>
              </Copier>
              <BaseTip
                className={styles.tip}
                tips={localText[language]['scanWord_tips']}
              />
              <Button type="primary" onClick={handleBack}>
                <FormattedMessage id="scanWord_close" />
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
  connect(({ user, word, international }) => ({
    user,
    word,
    international
  }))(ScanWord)
)
