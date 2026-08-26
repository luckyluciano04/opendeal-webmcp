// Deployment-only configuration. Keep this file free of secrets.
// For a cross-origin supplier deployment, each supplier origin must explicitly
// allow the buyer origin here before it will expose tools or accept approval messages.
window.OPENDEAL_CONFIG = Object.freeze({
  supplierUrls: Object.freeze({
    alpha: '/supplier/alpha/',
    bravo: '/supplier/bravo/',
    charlie: '/supplier/charlie/'
  }),
  allowedBuyerOrigins: Object.freeze([])
});
