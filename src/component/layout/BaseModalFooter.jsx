import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd-mobile'
import styles from './BaseModalFooter.scss'

const BaseModalFooter = function(props) {
  const { cancelText, okText, onCancel, onOk, loading, cancelLoading } = props
  return (
    <div className={styles.footer}>
      <Button
        className={styles.cancel}
        onClick={onCancel}
        loading={cancelLoading}
      >
        {cancelText || '取消'}
      </Button>
      <Button type="primary" onClick={onOk} loading={loading}>
        {okText || '确定'}
      </Button>
    </div>
  )
}

BaseModalFooter.propTypes = {
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  loading: PropTypes.bool,
  cancelLoading: PropTypes.bool
}

export default BaseModalFooter
