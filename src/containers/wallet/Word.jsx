import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import paths from '../../utils/paths'
import { Button } from 'antd-mobile'
import BaseLabel from '../../component/layout/BaseLabel'
import styles from './Word.scss'
import BaseTip from '../../component/layout/BaseTip'
import { FormattedMessage, localText } from '../../i18n'

const Word = function(props) {
  const {
    wallet: { word },
    international: { language },
    history
  } = props
  const handleToConfirm = () => {
    history.push(paths.confirmWord)
  }
  return (
    <Fragment>
      <BaseLabel label={localText[language]['Word_label']} />
      <div className={styles.cont}>{word}</div>
      <BaseTip
        className={styles.tip}
        tips={[localText[language]['Word_Tip']]}
      />
      <Button type="primary" onClick={handleToConfirm}>
        <FormattedMessage id="Word_btn" />
      </Button>
    </Fragment>
  )
}

export default withRouter(
  connect(({ wallet, international }) => ({
    wallet,
    international
  }))(Word)
)
