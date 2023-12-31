module.exports = {
    parameters: [
        { name: "category", required: true, type: "string", msg: "The category for the search query. (e.g: film)"},
        { name: "query", required: true, type: "string", msg: "Your query string"},
        { name: "page", required: false, type: "number", msg: "The page you want to fetch"},
    ],
    func: async (Client, Modules_, req, res) => {
        return Modules_.ztParser.search(
            req.query.category ?? "films",
            req.query.query,
            req.query.page ?? 1
        )
    } // end func
}