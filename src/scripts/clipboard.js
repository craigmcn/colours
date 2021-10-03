export const initClipboardCopy = () => {
    if (!navigator.clipboard) {
        const copy = document.getElementById('copy')
        copy.parentNode.removeChild(copy)

        const copyComponents = document.querySelectorAll('.js-copy')
        copyComponents.forEach((el) => {
            el.parentNode.removeChild(el)
        })
    } else {
        Array.from(document.querySelectorAll('button[data-copy]')).forEach(el =>
            el.addEventListener('click', () => {
                navigator.clipboard.writeText(el.dataset.copy).then(function () {
                    el.classList.add('button--success')
                    setTimeout(() => {
                        el.classList.remove('button--success')
                    }, 1200)
                })
            }),
        )
    }
}

export const copyComponent = (hex, rgb, hsl) => {
    const copy = document.createElement('div')
    copy.classList = 'flex flex__item--as-center m-l-auto m-b-0 js-copy'

    const copyContainer = document.createElement('div')

    const copyIcon = document.createElement('span')
    copyIcon.classList = 'fad fa-copy m-r-xs'
    copyIcon.setAttribute('aria-hidden', true)

    const copyText = document.createElement('span')
    copyText.classList = 'visually-hidden'
    copyText.innerText = 'Copy'

    const copyHex = document.createElement('button')
    copyHex.classList = 'button button--sm js-hex'
    copyHex.innerText = 'HEX'
    copyHex.dataset.copy = hex

    const copyRgb = document.createElement('button')
    copyRgb.classList = 'button button--sm js-rgb'
    copyRgb.innerText = 'RGB'
    copyRgb.dataset.copy = rgb

    const copyHsl = document.createElement('button')
    copyHsl.classList = 'button button--sm js-hsl'
    copyHsl.innerText = 'HSL'
    copyHsl.dataset.copy = hsl

    copyContainer.appendChild(copyIcon)
    copyContainer.appendChild(copyText)
    copyContainer.appendChild(copyHex)
    copyContainer.appendChild(copyRgb)
    copyContainer.appendChild(copyHsl)

    copy.appendChild(copyContainer)

    return copy
}
