const [P, F] = ['Pass', 'Fail']

const update = (level, test, result) => {
    const el = document.getElementById(test)
    if (result === P) {
        el.classList.add('pass')
        el.querySelector(`.label--wcag${level}>span`).classList.add('pass')
        el.querySelector('.label--warn')?.setAttribute('hidden', true)
    } else {
        el.classList.remove('pass')
        el.querySelector(`.label--wcag${level}>span`).classList.remove('pass')
        el.querySelector('.label--warn')?.removeAttribute('hidden')
    }
    el.querySelector(`.label--wcag${level}>span`).innerText = result
}

export const passFail = (test, value) => {
    switch (test) {
        case 'link2Body':
            if (value < 3) {
                update('A', test, F)
            } else {
                update('A', test, P)
            }
            break

        case 'link2Bg': // fallthrough
        case 'body2Bg':
            if (value < 4.5) {
                update('AAA', test, F)
                update('AA', test, F)
            } else {
                if (value < 7) {
                    update('AAA', test, F)
                } else {
                    update('AAA', test, P)
                }
                update('AA', test, P)
            }
            break

        default:
            // do nothing
    }
}
