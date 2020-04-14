export default {
  lang: 'EN',

  password: 'Password',
  password_tip: 'Please enter a password',
  password_placeholder: 'Please enter',
  newPassword_callback:
    'Please confirm that the password you filled in is the same! ',
  newPassword: 'New Password',
  newPasswordTip: '(8-16 characters, including letters and numbers)',
  newPasswordMessage: 'Please enter a new password',
  newPasswordMessage2: 'Please enter 8-16 characters',
  newPasswordMessage3: 'Password contains letters and numbers',
  newPasswordConfirm: 'Confirm Password',
  newPasswordConfirmMessage: 'Please enter a confirmation password', // login

  login_btn: 'Login',
  login_title: 'Login to VNT Wallet',
  login_tip1: 'Login to another wallet? ',
  login_link1: 'Restore wallet from mnemonic',
  login_tip2: 'No wallet? ',
  login_link2: 'Create a wallet', // home

  login_errorMsg: 'Incorrect password',

  home_title: 'Home',
  home_detail: 'Details',
  home_rollIn: 'Receive',
  home_rollOut: 'Send',
  home_history: 'Transaction History',
  home_history_toBrowser: 'Go to the browser to view',
  home_history_orderID: 'Transaction id', // ScanWord

  scanWord_title: 'View mnemonic words',
  scanWord_warn: "Don't show mnemonics to anyone! ",
  scanWord_tips: [
    'important hint:',
    'The mnemonic is used to restore your wallet, copy it down in order, and store it in a safe place! ',
    'If you accidentally forget your mnemonic, the assets in your wallet will not be recoverable. '
  ],
  scanWord_copy: 'Copy to clipboard',
  scanWord_close: 'Close', // about

  about_Header_title: 'About Us',
  about_title: 'VNT Wallet Plugin',
  about_copyright: 'Copyright © ️ VNT Chain 2018 All Rights Reserved.',
  about_link: 'Link',
  about_vnt_browser: 'VNT Blockchain Browser',
  about_vnt_address: 'VNT official website',
  about_us: 'Contact Us',
  about_vx: 'WeChat public account', // law

  laws_title: 'VNT Wallet User Terms', // ImportKeystone

  ImportKeystone_private: 'Please paste your private key:', // ImportKeystone_privateTip: 'Please paste your private key',
  ImportKeystone_file: 'Select File',
  ImportKeystone_fileTip: 'Please upload keystore',
  ImportKeystone_title: 'Import Address',
  ImportKeystone_warns: [
    'Imported addresses cannot be recovered from the mnemonic of the current wallet. ',
    'If you switch wallets, the address will disappear from the wallet,',
    'Need to re-import. ',
    'Please keep the private key of this address separately! '
  ],
  ImportKeystone_type: 'Type:', // send

  send_validateToAddr_callback: 'Please enter an address',
  send_validateToAddr_callback2: 'Please enter the correct address',
  send_validateBalance_callback: 'Please enter quantity',
  send_validateBalance_callback2: 'Please enter the correct quantity',
  send_validateBalance_callback3:
    'Send quantity is greater than holding balance',
  send_from: 'From:',
  send_to: 'Send to:',
  send_addressTip: 'Please enter a receiving address',
  send_num: 'Quantity:',
  send_numTip: 'Please enter the number of send',
  send_all: 'All',
  send_postscript: 'Remark data:',
  send_postscriptTip: 'Remark data requires less than 200 characters',
  send_postscript_placeholder:
    'Please fill in transaction note data, not required ',
  send_serviceCharge: 'Commission fee:',
  send_custom: 'Custom',
  send_send: 'Send',
  send_title: 'Send VNT', // Commission

  commission_ErrorMessage_validatePrice: 'Insufficient balance',
  commission_ErrorMessage_validateLimit1: 'Gas Limit is too low',
  commission_ErrorMessage_validateLimit2: 'Insufficient balance',
  commission_ErrorMessage_info: 'Illegal character',
  commission_title: 'Custom Commission fee',
  commission_serviceCharge: 'Commission fee:',
  commission_setting: 'Recommended Settings',
  commission_price_label1: 'Gas Price (GWEI)',
  commission_price_label2: 'Gas Limit',
  commission_baseTip: [
    'Tips:',
    '· We recommend that you use the parameter settings recommended by the system. ',
    '· Gas Price is high, the transaction confirmation speed is fast; Gas Price is low, the transaction speed is slow. ',
    '· Gas Limit is too low, which will cause transaction execution to fail. '
  ],
  commission_TransferNum: 'Number of transfers',
  commission_total: 'Total',
  commission_trading: 'Send a transaction',
  commission_confirm: 'OK', // TxDetail

  TxDetail_title: 'Transaction Details',
  TxDetail_copy: 'Copy',
  TxDetail_okText: 'Accelerate transactions',
  TxDetail_cancelText: 'Cancel transaction', // OuterAuth

  OuterAuth_titleh3: 'Request for your VNT address',
  OuterAuth_from: 'Request From:',
  OuterAuth_address: 'Your address:',
  OuterAuth_Tip: `Requesting to obtain your address so that it can provide subsequent services.
  This means that it will be able to query the amount of your assets and related transactions at that address.
  If it wants to transfer assets from your address, then every transfer requires your reapproval. `,
  OuterAuth_cancelText: 'Rejected',
  OuterAuth_okText: 'Agree', // OuterSend

  OuterSend_title: 'Send VNT (',
  OuterSend_from: 'From:',
  OuterSend_to: 'Send to:',
  OuterSend_num: 'Quantity:',
  OuterSend_serviceCharge: 'Commission fee:',
  OuterSend_commission: 'Custom',
  OuterSend_mark: 'Remarks:',
  OuterSend_cancelText: 'Rejected',
  OuterSend_okText: 'Agree', // Wallet

  Wallet_title: `VNT Wallet`, // ExportKeystone

  ExportKeystone_Modal_title: 'Export Private Key',
  ExportKeystone_address: 'Address',
  ExportKeystone_addrCopy: 'Copy address',
  ExportKeystone_private: 'Key',
  ExportKeystone_privateCopy: 'Copy Key',
  ExportKeystone_DownloadLoading: 'File preparation ...',
  ExportKeystone_downloadJson: 'Download JSON',
  ExportKeystone_tip: [
    'note',
    'Never make this private key public. Anyone with your private key can steal assets from your address. '
  ],
  ExportKeystone_ok: 'Done', // UserDetail

  UserDetail_toVnt: 'Go to VNT browser',
  UserDetail_expPrivate: 'Export Private Key', // WordForm

  WordForm_error: 'Sorry! The mnemonic is wrong! ',
  WordForm_label: 'Confirm your mnemonic',
  WordForm_message: 'Please enter a mnemonic',
  WordForm_placeholder:
    'Please separate mnemonics with spaces and enter them in order. ',
  WordForm_ok: 'Confirm', // Create

  Create_messageWarn: 'Please read and agree to the terms of service',
  Create_Read_term: 'I have read and agree',
  Create_term: 'Terms of Service',
  Create_create: 'Create',
  Create_title: 'Create Wallet',
  Create_title2:
    'Remember your password, it will be used to log in to the wallet. ', // RegainWord
  Create_msg: 'Wallet created success !',

  RegainWord_label: 'Confirm your mnemonic',
  RegainWord_message: 'Please enter a mnemonic',
  RegainWord_placeholder: 'Please enter a mnemonic',
  RegainWord_recover: 'Recover Wallet',
  RegainWord_msg: 'Restore wallet successfully!',
  // Word
  Word_label: 'Confirm your mnemonic',
  Word_Tip: [
    'important hint:',
    'The mnemonic is used to restore your wallet, copy it down in order, and store it in a safe place! ',
    'If you accidentally forget your mnemonic, the assets in your wallet will not be recoverable. '
  ],
  Word_btn: 'I have recorded it',

  // Copier
  Copier_message: 'Copy success ! ',

  //setting
  set_import: 'External import',
  set_errMsg: 'Imported addresses cannot view mnemonics words',
  //BaseModalFooter
  BaseModalFooter_Cancel: 'Cancel',
  BaseModalFooter_ok: 'OK'
}
