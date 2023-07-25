module.exports = {
    parameters: [
        { name: "category", required: true, type: "string", msg: "The category for the search query. (e.g: film)"},
        { name: "query", required: true, type: "string", msg: "Your query string"},
    ],
    func: async (Client, Modules_, req, res) => {
        return Modules_.ztParser.searchAll(
            req.query.category ?? "films",
            req.query.query
        )
    } // end func
}