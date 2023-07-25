module.exports = {
    parameters: [
        { name: "id", required: true, type: "number", msg: "The ID of the film"},
    ],
    func: async (Client, Modules_, req, res) => {
        return Modules_.ztParser.getMovieDetails(
            req.query.id
        )
    } // end func
}