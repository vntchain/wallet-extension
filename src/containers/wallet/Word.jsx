import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import paths from '../../utils/paths'
import { Button } from 'antd-mobile'
import BaseLabel from '../../component/layout/BaseLabel'
import styles from './Word.scss'
import BaseTip from '../../component/layout/BaseTip'

const Word = function(props) {
  const {
    wallet: { word },
    history
  } = props
  const handleToConfirm = () => {
    history.push(paths.confirmWord)
  }
  return (
    <Fragment>
      <BaseLabel label={'确认您的助记词'} />
      <div className={styles.cont}>{word}</div>
      <BaseTip
        tips={[
          '重要提示：',
          '助记词用于恢复您的钱包，按照顺序将它抄写下来，并存放在安全的地方！',
          '如果您不慎将助记词遗忘，那么钱包中的资产将无法挽回。'
        ]}
      />
      <Button type="primary" onClick={handleToConfirm}>
        我已经记录好
      </Button>
    </Fragment>
  )
}

export default withRouter(
  connect(({ wallet }) => ({
    wallet
  }))(Word)
)
