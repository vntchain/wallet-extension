export default {
  lang: '中',

  password: '密码',
  password_tip: '请输入密码',
  password_placeholder: '请输入',
  newPassword_callback: '请确认两次填写的密码相同！',
  newPassword: '新密码',
  newPasswordTip: '(8-16位字符，包含字母和数字)',
  newPasswordMessage: '请输入新密码',
  newPasswordMessage2: '请输入8-16位字符',
  newPasswordMessage3: '密码包含字母和数字',
  newPasswordConfirm: '确认密码',
  newPasswordConfirmMessage: '请输入确认密码',

  // login
  login_btn: '登录',
  login_title: '登录VNT钱包',
  login_tip1: '登录另一个钱包？',
  login_link1: '从助记词恢复钱包',
  login_tip2: '没有钱包？',
  login_link2: '创建钱包',

  login_errorMsg: '密码错误',
  // home
  home_title: '首页',
  home_detail: '详情',
  home_rollIn: '转入',
  home_rollOut: '转出',
  home_history: '交易历史',
  home_history_toBrowser: '去浏览器查看',
  home_history_orderID: '交易id',

  //ScanWord
  scanWord_title: '查看助记词',
  scanWord_warn: '不要对任何人展示助记词！',
  scanWord_tips: [
    '重要提示：',
    '助记词用于恢复您的钱包，按照顺序将它抄写下来，并存放在安全的地方！',
    '如果您不慎将助记词遗忘，那么钱包中的资产将无法挽回。'
  ],
  scanWord_copy: '复制到剪贴板',
  scanWord_close: '关闭',

  // about
  about_Header_title: '关于我们',
  about_title: 'VNT钱包插件',
  about_copyright: 'Copyright ©️ VNT Chain 2018 All Rights Reserved.',
  about_link: '链接',
  about_version: 'v1.0.0',
  about_vnt_browser: 'VNT 区块链浏览器',
  about_vnt_address: 'VNT 官方网站',
  about_us: '联系我们',
  about_vx: '微信公众号',

  //law
  laws_title: 'VNT钱包用户条款',

  //ImportKeystone
  ImportKeystone_private: '请粘贴你的私钥:',
  ImportKeystone_privateTip: '请粘贴你的私钥',
  ImportKeystone_file: '选择文件',
  ImportKeystone_fileTip: '请上传keystore',
  ImportKeystone_title: '导入地址',
  ImportKeystone_warns: [
    '导入的地址不能从当前钱包的助记词恢复。',
    '如果你切换了钱包，该地址将从钱包中消失，',
    '需要重新导入。',
    '请另行保管该地址的私钥！'
  ],
  ImportKeystone_type: '选择类型:',

  //send
  send_validateToAddr_callback: '请输入地址',
  send_validateToAddr_callback2: '请输入正确的地址',
  send_validateBalance_callback: '请输入数量',
  send_validateBalance_callback2: '请输入正确的数量',
  send_validateBalance_callback3: '发送数量大于持有余额',
  send_from: '来自:',
  send_to: '发送至:',
  send_addressTip: '请输入接收地址',
  send_num: '数量:',
  send_numTip: '请输入发送数量',
  send_all: '全部',
  send_postscript: '备注数据:',
  send_postscriptTip: '备注数据要求200字符以内',
  send_postscript_placeholder: '请填写交易备注数据，非必填。',
  send_serviceCharge: '手续费:',
  send_custom: '自定义',
  send_send: '发送',
  send_title: '发送VNT',

  //Commission
  commission_ErrorMessage_validatePrice: '余额不足',
  commission_ErrorMessage_validateLimit1: 'Gas Limit 过低',
  commission_ErrorMessage_validateLimit2: '余额不足',
  commission_ErrorMessage_info: '非法字符',
  commission_title: '自定义手续费',
  commission_serviceCharge: '手续费',
  commission_setting: '推荐设置',
  commission_baseTip: [
    '温馨提示：',
    '· 我们建议您使用系统推荐的参数设置。',
    '· Gas Price高，交易确认的速度快；Gas Price低，交易速度慢。',
    '· Gas Limit过低，会导致交易执行失败。'
  ],
  commission_TransferNum: '转账数量',
  commission_total: '总计',
  commission_trading: '发送交易',
  commission_confirm: '确定',

  //TxDetail
  TxDetail_title: '交易详情',
  TxDetail_copy: '复制',
  TxDetail_okText: '加速交易',
  TxDetail_cancelText: '取消交易',

  //OuterAuth
  OuterAuth_titleh3: '请求获得您的VNT地址',
  OuterAuth_from: '请求来源:',
  OuterAuth_address: '您的地址:',
  OuterAuth_Tip: `正在请求获得您的地址，以便它提供后续服务。
  这意味着它能够查询到您在该地址的资产数量及相关交易。
  如果它想从您的地址转移资产，那么每次转账都需要您重新批准。`,
  OuterAuth_cancelText: '拒绝',
  OuterAuth_okText: '同意',

  //OuterSend
  OuterSend_title: '发送VNT(',
  OuterSend_from: '来自：',
  OuterSend_to: '发送至：',
  OuterSend_num: '数量：',
  OuterSend_serviceCharge: '手续费：',
  OuterSend_commission: '自定义',
  OuterSend_mark: '备注：',
  OuterSend_cancelText: '拒绝',
  OuterSend_okText: '同意',

  //Wallet
  Wallet_title: `VNT钱包`,

  //ExportKeystone
  ExportKeystone_Modal_title: '导出私钥',
  ExportKeystone_address: '地址',
  ExportKeystone_addrCopy: '复制地址',
  ExportKeystone_private: '私钥',
  ExportKeystone_privateCopy: '复制私钥',
  ExportKeystone_DownloadLoading: '文件准备中...',
  ExportKeystone_downloadJson: '下载JSON文件',
  ExportKeystone_tip: [
    '注意',
    '永远不要公开这个私钥。任何拥有你的私钥的人都可以窃取你地址上的资产。'
  ],
  ExportKeystone_ok: '完成',

  //UserDetail
  UserDetail_toVnt: '去VNT浏览器上查看',
  UserDetail_expPrivate: '导出私钥',

  //ConfirmWord
  WordForm_error: '抱歉！助记词错误！',
  WordForm_label: '确认您的助记词',
  WordForm_message: '请输入助记词',
  WordForm_placeholder: '请使用空格分隔助记词，按照顺序依次输入。',
  WordForm_ok: '确认',

  //Create
  Create_messageWarn: '请阅读并同意服务条款',
  Create_Read_term: '我已阅读并同意',
  Create_term: '服务条款',
  Create_create: '创建',
  Create_title: '创建钱包',
  Create_title2: '请记住您的密码，将用于登录钱包。',
  Create_msg: '创建钱包成功!',

  //RegainWord
  RegainWord_label: '确认您的助记词',
  RegainWord_message: '请输入助记词',
  RegainWord_placeholder: '请输入助记词',
  RegainWord_recover: '恢复钱包',
  RegainWord_msg: '恢复钱包成功！',

  //Word
  Word_label: '确认您的助记词',
  Word_Tip: [
    '重要提示：',
    '助记词用于恢复您的钱包，按照顺序将它抄写下来，并存放在安全的地方！',
    '如果您不慎将助记词遗忘，那么钱包中的资产将无法挽回。'
  ],
  Word_btn: '我已经记录好',

  //Copier
  Copier_message: '复制成功！',

  //setting
  set_import: '外部导入',
  set_errMsg: '导入的地址不能查看助记词',

  //BaseModalFooter
  BaseModalFooter_Cancel: '取消',
  BaseModalFooter_ok: '确定'
}
