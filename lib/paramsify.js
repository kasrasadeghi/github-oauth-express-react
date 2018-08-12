
const paramsify = (params) => Object.keys(params).map(k => [k, params[k]].map(decodeURIComponent).join('=')).join('&');
const unparamsify = (search) => {
    const params = new URLSearchParams(search);
    let result = {}
    for (let k of params.keys()) {
        result[k] = params.get(k);
    }
    return result;
}

export {paramsify, unparamsify};
