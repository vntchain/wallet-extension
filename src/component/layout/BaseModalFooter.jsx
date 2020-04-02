import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd-mobile'
import styles from './BaseModalFooter.scss'
import { connect } from 'react-redux'
import { localText } from '../../i18n'
const BaseModalFooter = function(props) {
  const {
    cancelText,
    okText,
    onCancel,
    onOk,
    loading,
    cancelLoading,
    international: { language }
  } = props
  return (
    <div className={styles.footer}>
      <Button
        className={styles.cancel}
        onClick={onCancel}
        loading={cancelLoading}
      >
        {cancelText || localText[language]['BaseModalFooter_Cancel']}
      </Button>
      <Button type="primary" onClick={onOk} loading={loading}>
        {okText || localText[language]['BaseModalFooter_ok']}
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

export default connect(({ international }) => ({ international }))(
  BaseModalFooter
)
