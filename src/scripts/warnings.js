export const addWarning = (el, text) => {
  const warningEl = document.createElement('div')
  warningEl.classList.add('form__control-warning')
  warningEl.innerText = text
  el.classList.add('form__control--hasWarning')
  el.insertAdjacentElement('beforebegin', warningEl)
}

export const clearWarnings = () => {
  document
    .querySelectorAll('.form__control-warning')
    .forEach(el => el.parentNode.removeChild(el))
  document
    .querySelectorAll('.form__control--hasWarning')
    .forEach(el => el.classList.remove('form__control--hasWarning'))
}
