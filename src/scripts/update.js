import { contrastRatio, contrastTextColor } from './contrastRatio';
import { hex2Rgb, hex2Str, hsl2Str, rgb2Str } from './convertColours';
import { splitHex } from './parseValues';
import { passFail } from './passFail';

const updateContrast = (obj) => {
    Object.keys(obj).forEach((k) => {
        document.getElementById(k).querySelector('.contrast__value').innerText =
      obj[k];
        passFail(k, obj[k]);
    });
};

const updateFocusStyle = (linkColor) => {
    const exLinkStyle = document.getElementById('exLinkStyle');
    if (exLinkStyle) exLinkStyle.remove();
    const styles = `.exLink:focus{ box-shadow: 0 0 0 0.2rem rgba(${linkColor},0.5) }`;
    const styleTag = document.createElement('style');
    styleTag.id = 'exLinkStyle';
    if (styleTag.styleSheet) {
        styleTag.styleSheet.cssText = styles;
    } else {
        styleTag.appendChild(document.createTextNode(styles));
    }
    document.getElementsByTagName('head')[0].appendChild(styleTag);
};

export const updateColor = (el, bgHex, fgHex) => {
    const source = el.querySelector('.swatch__source');
    const compare = el.querySelector('.swatch__compare');

    source.style.backgroundColor = hex2Str(bgHex);
    source.style.color = hex2Str(fgHex);
    compare.style.backgroundColor = hex2Str(bgHex);
    compare.style.color = hex2Str(fgHex);
};

export const updateCopy = (hex, rgb, hsl, el) => {
    const parent = el || document;

    let copy = parent.querySelector('.js-hex[data-copy]');
    let text = hex2Str(hex);
    copy.dataset.copy = text;
    copy.title = `Copy ${text}`;

    copy = parent.querySelector('.js-rgb[data-copy]');
    text = rgb2Str(rgb);
    copy.dataset.copy = text;
    copy.title = `Copy ${text}`;

    copy = parent.querySelector('.js-hsl[data-copy]');
    text = hsl2Str(hsl);
    copy.dataset.copy = text;
    copy.title = `Copy ${text}`;
};

export const updateExample = () => {
    const linkColor = document.getElementById('linkColor');
    const textColor = document.getElementById('textColor');
    const bgColor = document.getElementById('bgColor');
    const exBgEl = document.querySelector('.exBg');
    const selector = '.swatch__compare > .swatch__values > .value-hex';
    const exLink =
        linkColor.closest('.card').querySelector(selector).innerText ||
        linkColor.dataset.default;
    const exText =
        textColor.closest('.card').querySelector(selector).innerText ||
        textColor.dataset.default;
    const exBg =
        bgColor.closest('.card').querySelector(selector).innerText ||
        bgColor.dataset.default;
    const linkRgb = hex2Rgb(splitHex(exLink));
    const textRgb = hex2Rgb(splitHex(exText));
    const exBgRgb = hex2Rgb(splitHex(exBg));
    const link2Body = contrastRatio(linkRgb, textRgb);
    const link2Bg = contrastRatio(linkRgb, exBgRgb);
    const body2Bg = contrastRatio(textRgb, exBgRgb);

    document.querySelector('.exLink').style.color = exLink;
    document.querySelector('.exText').style.color = exText;
    exBgEl.style.backgroundColor = exBg;
    exBgEl.style.borderColor = exText;

    updateFocusStyle(linkRgb);
    updateContrast({ link2Body, link2Bg, body2Bg });
};

export const updateSwatch = (id, hex, rgb, hsl) => {
    const target = document.getElementById(id);
    target.style.backgroundColor = rgb2Str(rgb);

    const textColor = contrastTextColor(rgb);
    target.style.color = hex2Str(textColor.AAA.hex);

    target.querySelector('.js-hex').innerText = hex2Str(hex);
    target.querySelector('.js-rgb').innerText = rgb2Str(rgb);
    target.querySelector('.js-hsl').innerText = hsl2Str(hsl);

    id === 'resSwatch' && updateCopy(hex, rgb, hsl);
};

export const updateValues = (el, hex, rgb, hsl, updateSatLight) => {
    el.querySelectorAll('.value-rgb').forEach(
        val => (val.innerText = rgb2Str(rgb)),
    );
    el.querySelectorAll('.value-hsl').forEach(
        val => (val.innerText = hsl2Str(hsl)),
    );
    el.querySelectorAll('.value-hex').forEach(
        val => (val.innerText = hex2Str(hex)),
    );

    if (updateSatLight) {
        el.querySelector('.saturation').value = hsl[1].substring(
            0,
            hsl[1].length - 1,
        );
        el.querySelector('.lightness').value = hsl[2].substring(
            0,
            hsl[2].length - 1,
        );
    }
};
