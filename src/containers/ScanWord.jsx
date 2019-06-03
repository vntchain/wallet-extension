import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import styles from './ScanWord.scss'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import BaseWarn from '../component/layout/BaseWarn'
import PasswordForm from './home/PasswordForm'
import BaseTip from '../component/layout/BaseTip'
import { Button } from 'antd-mobile'

const ScanWord = function(props) {
  const { hasAuth, word } = props
  const handleBack = () => {}
  const handleFetchWord = () => {}
  const handleCopy = () => {}
  return (
    <Fragment>
      <Header title={'查看助记词'} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <BaseWarn warns={['不要对任何人展示助记词！']} />
          {hasAuth ? (
            <Fragment>
              <div className={styles.cont}>
                {word.map(item => (
                  <Fragment key={item}>{`${item} `}</Fragment>
                ))}
              </div>
              <a
                className={styles.copy}
                href="javascript:"
                onClick={() => handleCopy}
              >
                复制到剪贴板
              </a>
              <BaseTip
                tips={[
                  '重要提示：',
                  '助记词用于恢复您的钱包，按照顺序将它抄写下来，并存放在安全的地方！',
                  '如果您不慎将助记词遗忘，那么钱包中的资产将无法挽回。'
                ]}
              />
              <Button type="primary">关闭</Button>
            </Fragment>
          ) : (
            <PasswordForm onCancel={handleBack} onOk={handleFetchWord} />
          )}
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default connect(() => ({
  hasAuth: true,
  word: [1, 2, 3]
}))(ScanWord)
