export function updateWorkList(pConnect, key, payload = undefined) {
  PCore.getDataApiUtils()
    .getData(key, payload)
    .then(responseData => {
      const dataObject = {};
      dataObject[key] = {
        pxResults: responseData.data.data
      };

      pConnect.updateState(dataObject);
    })
    .catch(err => {
      console.error(err?.stack);
    });
}
