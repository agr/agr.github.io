// Deploy-time configuration for the static UI.
// Edit these values when hosting the UI separately from the Function API.
window.APP_CONFIG = {
  // Absolute base URL of the API (e.g. "https://my-func.azurewebsites.net/api").
  // Leave empty ("") to use the same origin the UI is served from ("/api").
  apiBaseUrl: "https://image-host-imghost.azurewebsites.net/api",
  // Additional trusted API origins (scheme+host+port) the UI may talk to and
  // send the auth token to. The apiBaseUrl's origin and the UI's own origin
  // are always trusted implicitly. Example: ["https://my-func.azurewebsites.net"].
  trustedApiOrigins: []
};
