import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Header from '../component/layout/Header'
import CommonPadding from '../component/layout/CommonPadding'
import Copier from '../component/Copier'
import paths from '../utils/paths'
import { calBigMulti } from '../utils/helper'
import styles from './TxDetail.scss'

const TxDetail = function(props) {
  const idCopyRef = React.createRef()
  const fromCopyRef = React.createRef()
  const toCopyRef = React.createRef()
  const refObj = {
    idCopyRef,
    fromCopyRef,
    toCopyRef
  }
  const {
    user: { currTrade },
    price: { vntToCny }
  } = props
  console.log(props) //eslint-disable-line
  const id = props.match.params.id
  const txDetail = currTrade.find(item => item.id === id)
  const renderTotal = total => (
    <div>
      <div className={styles.cont}>{total}</div>
      <div className={styles.info}>{calBigMulti(total, vntToCny)}</div>
    </div>
  )
  const DetailList = [
    {
      status: {
        label: '状态'
      },
      id: {
        label: '交易id',
        hasCopy: true
      },
      time: '时间',
      from: {
        label: '来自',
        hasCopy: true
      },
      to: {
        label: '至',
        hasCopy: true
      }
    },
    {
      data: '备忘数据'
    },
    {
      value: {
        label: '数量',
        render: text => `${text} VNT`
      },
      gas: 'Gas Limit',
      gasUsed: 'Gas Used',
      gasPrice: 'Gas Price（GWEI）',
      total: {
        label: '总量',
        render: text => renderTotal(text)
      }
    }
  ]
  return (
    <Fragment>
      <Header title={'交易详情'} hasBack={true} backUrl={paths.home} />
      <div className={styles.container}>
        <CommonPadding>
          {DetailList.map((blocks, index) => (
            <div className={styles.block} key={index}>
              {Object.keys(blocks).map(item => {
                const val = blocks[item]
                return (
                  <div className={styles['block-item']} key={item}>
                    <label>{typeof val === 'string' ? val : val.label}</label>
                    {val.render ? (
                      val.render(txDetail[item])
                    ) : val.hasCopy ? (
                      <div className={styles.inner}>
                        <span className={styles.cont}>{txDetail[item]}</span>
                        <Copier
                          text={txDetail[item]}
                          ref={refObj[`${item}CopyRef`]}
                        >
                          <span className={styles.copy}>复制</span>
                        </Copier>
                      </div>
                    ) : (
                      <span className={styles.cont}>{txDetail[item]}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default withRouter(
  connect(({ user, price }) => ({ user, price }))(TxDetail)
)
