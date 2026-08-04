// In Live mode the catalogue is sourced from WordPress, so admin write
// operations on products / categories / stock are blocked with a clear message.
export function blockCatalogWritesInLive(req, res, next) {
  if (req.dataMode !== "live" || req.method === "GET") return next();
  if (/^\/(products|categories|inventory)/.test(req.path)) {
    return res.status(409).json({
      message:
        "Live mode reads the catalogue from WordPress. Switch to Demo mode to add, edit or delete products, categories and stock.",
    });
  }
  return next();
}

export default blockCatalogWritesInLive;
