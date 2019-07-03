export default (content, fileName, suffix) => {
  return new Promise(resolve => {
    const url = window.URL.createObjectURL(
      new Blob([content], { type: 'text/plain;charset=utf-8' })
    )
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${fileName}.${suffix}`)
    document.body.appendChild(link)
    link.click()
    // document.removeChild(link)
    resolve('success')
  })
}
