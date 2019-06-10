import React, { Fragment } from 'react'
// import { Button } from 'antd-mobile'
import { Input, Button } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseLabel from '../component/layout/BaseLabel'
import BaseTip from '../component/layout/BaseTip'
import styles from './Commission.scss'

const Send = function() {
  const handleSubmit = () => {}
  const handleDefault = () => {}
  return (
    <Fragment>
      <Header title={'自定义手续费'} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <div className={`${styles.outlineFlex} ${styles.blocks}`}>
            <div className={styles.innerFlex}>
              <BaseLabel label={'手续费：'} />
              <span>
                <div className={styles.value}>${`111VNT`}</div>
                <div className={styles.info}>${`￥123`}</div>
              </span>
            </div>
            <a
              className={styles.btn}
              href="javascript:"
              onClick={handleDefault}
            >
              推荐设置
            </a>
          </div>
          <div className={styles.blocks}>
            <div className={styles.price}>
              <div>
                <label>Gas Price（GWEI)</label>
                <Input size="large" />
              </div>
              <div>
                <label>Gas Limit</label>
                <Input size="large" />
              </div>
            </div>
            <BaseTip
              tips={[
                '温馨提示：',
                '· 我们建议您使用系统推荐的参数设置。',
                '· Gas Price高，交易确认的速度快；Gas Price低，交易速度慢。',
                '· Gas Limit过低，会导致交易执行失败。'
              ]}
            />
          </div>
          <div className={`${styles.blocks} ${styles.total}`}>
            <div className={styles.outlineFlex}>
              <span className={styles.info}>转账数量</span>
              <span className={styles.value}>111</span>
            </div>
            <div className={styles.outlineFlex}>
              <span className={styles.info}>手续费</span>
              <span className={styles.value}>111</span>
            </div>
            <div className={styles.outlineFlex}>
              <span className={styles.info}>总计</span>
              <span className={styles.value}>111</span>
            </div>
          </div>
          <Button
            className={styles.button}
            type="primary"
            size="large"
            onClick={handleSubmit}
          >
            确定
          </Button>
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default Send
