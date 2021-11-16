import { forEachAll } from './helpers.js';

export function patchAttributes(srcAttrs, dstAttrs) {
  for (let i = 0, attrs = [...srcAttrs]; i < attrs.length; ++i) {
    const srcAttr = attrs[i];
    const dstAttr = dstAttrs.getNamedItem(attrs[i].name);
    if (dstAttr === null || dstAttr.value !== srcAttr.value) {
      dstAttrs.setNamedItem(srcAttr.cloneNode(false));
    }
  }
  for (let i = 0, attrs = [...dstAttrs]; i < attrs.length; ++i) {
    const dstAttr = attrs[i];
    if (process.env.NODE_ENV !== 'production' && dstAttr.name === 'style') {
      continue;
    }
    if (srcAttrs.getNamedItem(dstAttr.name) === null) {
      dstAttrs.removeNamedItem(dstAttr.name);
    }
  }
}

export function patchNode(parentNode, srcNode, dstNode) {
  if (!srcNode && dstNode) {
    parentNode.removeChild(dstNode);
    return;
  } else if (srcNode && !dstNode) {
    parentNode.appendChild(srcNode);
    return;
  }
  if (srcNode.nodeType !== dstNode.nodeType) {
    parentNode.replaceChild(srcNode, dstNode);
    return;
  }
  switch (srcNode.nodeType) {
    case Node.TEXT_NODE:
      if (srcNode.nodeValue !== dstNode.nodeValue) {
        dstNode.nodeValue = srcNode.nodeValue;
      }
      break;
    case Node.ELEMENT_NODE:
      if (srcNode.nodeName !== dstNode.nodeName) {
        parentNode.replaceChild(srcNode, dstNode);
      } else {
        patchAttributes(srcNode.attributes, dstNode.attributes);
        patchNodes(srcNode, dstNode);
      }
      break;
    default:
      throw new Error(`unhandled node type: ${srcNode.nodeType}`);
  }
}

export function patchNodes(src, dst) {
  const [srcChildNodes, dstChildNodes] = [[...src.childNodes], [...dst.childNodes]];
  forEachAll(srcChildNodes, dstChildNodes, patchNode.bind(null, dst));
}
