import React, { Fragment } from 'react'
import { Button } from 'antd-mobile'
import { Input } from 'antd'
import CommonPadding from '../component/layout/CommonPadding'
import Header from '../component/layout/Header'
import BaseLabel from '../component/layout/BaseLabel'
import styles from './ImportKeystone.scss'

const Send = function() {
  const handleSubmit = () => {}
  return (
    <Fragment>
      <Header title={'自定义手续费'} hasBack={true} />
      <div className={styles.container}>
        <CommonPadding>
          <div>
            <BaseLabel label={'手续费：'} />
          </div>
          <Input />
          <Button type="primary" onClick={handleSubmit} />
        </CommonPadding>
      </div>
    </Fragment>
  )
}

export default Send
