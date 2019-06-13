import React, { Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import Header from '../component/layout/Header'
import Copier from '../component/Copier'
import styles from './TxDetail.scss'

const TxDetail = function(props) {
  const idCopyRef = React.createRef() //eslint-disable-line
  const fromCopyRef = React.createRef() //eslint-disable-line
  const toCopyRef = React.createRef() //eslint-disable-line
  const { txDetail } = props
  // const id = props.match.params.id
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
        label: '总量'
      }
    }
  ]
  return (
    <Fragment>
      <Header title={'发送VNT'} hasBack={true} />
      <div className={styles.container}>
        {DetailList.map((blocks, index) => (
          <div className={styles.block} key={index}>
            {Object.keys(blocks).map(item => {
              const val = blocks.item
              return (
                <div className={styles['block-item']} key={item}>
                  <label>{typeof val === 'string' ? val : val.label}</label>
                  {val.render ? (
                    val.render(txDetail[item])
                  ) : val.hasCopy ? (
                    <div className={styles.inner}>
                      <span className={styles.cont}>{txDetail[item]}</span>
                      <Copier text={txDetail[item]} copyRef={`${item}CopyRef`}>
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
      </div>
    </Fragment>
  )
}

export default withRouter(TxDetail)
