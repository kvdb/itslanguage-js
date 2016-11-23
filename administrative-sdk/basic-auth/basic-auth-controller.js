const BasicAuth = require('./basic-auth');

/**
 * Controller class for the BasicAuth model.
 */
module.exports = class BasicAuthController {
  /**
   * @param connection Object to connect to.
   */
  constructor(connection) {
    this._connection = connection;
  }

  /**
   * Create a basic authorization.
   *
   * @param {BasicAuth} basicAuth Object to create.
   * @returns Promise containing the newly created object.
   * @rejects If the server returned an error.
   */
  createBasicAuth(basicAuth) {
    const url = this._connection.settings.apiUrl + '/basicauths';
    const formData = JSON.stringify(basicAuth);
    const headers = new Headers();
    if (typeof formData === 'string') {
      headers.append('Content-Type',
        'application/json; charset=utf-8');
    }
    const options = {
      method: 'POST',
      headers,
      body: formData
    };
    return fetch(url, options)
      .then(response =>
        response.text()
          .then(textResponse => {
            if (!textResponse) {
              return Promise.reject(response.status + ': ' + response.statusText);
            }
            const result = JSON.parse(textResponse);
            if (response.ok) {
              return result;
            }
            return Promise.reject(result);
          })
      )
      .then(data => {
        const result = new BasicAuth(data.tenantId, data.principal, basicAuth.credentials);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        // Credentials are only supplied when generated by the backend.
        if (data.credentials) {
          result.credentials = data.credentials;
        }
        return result;
      });
  }
};
