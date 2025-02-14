import { updateImageSrcsWithAbsoluteURLs } from './utils';

export const getEmailBody = (body, pConn) => {
  return body !== null
    ? updateImageSrcsWithAbsoluteURLs(
        `<div>
        ${body
          .replace(/(\r\n|\n|\r)/gm, '')
          .replace('</head> <body>', '</head><body>')
          .replace(/(<p[^>]+>)/gm, '<p>')
          .replace('<sup>', '')
          .replace('</sup >', '')
          .replace(/>[\s]+</g, '><')
          .replaceAll('&nbsp;', ' ')}
      </div>`,
        pConn
      )
    : '';
};

export const escapeHTML = html => {
  const ele = document.createElement('div');
  ele.innerHTML = html;
  return ele.innerText;
};
