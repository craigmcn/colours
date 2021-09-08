export const initClipboardCopy = () => {
    if (!navigator.clipboard) {
        const copy = document.getElementById('copy')
        copy.parentNode.removeChild(copy)
    } else {
        Array.from(document.querySelectorAll('button[data-copy]')).forEach(el =>
            el.addEventListener('click', () => {
                navigator.clipboard.writeText(el.dataset.copy).then(function () {
                    el.classList.add('button--success')
                    setTimeout(() => {
                        el.classList.remove('button--success')
                    }, 1200)
                })
            })
        )
    }
}
