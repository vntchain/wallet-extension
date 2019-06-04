import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Button } from 'antd-mobile'
import BaseLabel from '../../component/layout/BaseLabel'
import styles from './Word.scss'
import BaseTip from '../../component/layout/BaseTip'

const Word = function(props) {
  const { word } = props
  return (
    <Fragment>
      <BaseLabel label={'确认您的助记词'} />
      <div className={styles.cont}>
        {word.map(item => (
          <Fragment key={item}>{`${item} `}</Fragment>
        ))}
      </div>
      <BaseTip
        tips={[
          '重要提示：',
          '助记词用于恢复您的钱包，按照顺序将它抄写下来，并存放在安全的地方！',
          '如果您不慎将助记词遗忘，那么钱包中的资产将无法挽回。'
        ]}
      />
      <Button type="primary">我已经记录好</Button>
    </Fragment>
  )
}

export default connect(() => ({
  word: [1, 2, 3]
}))(Word)
