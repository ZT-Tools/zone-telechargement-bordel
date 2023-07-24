module.exports = {
    parameters: [
        { name: "message", required: true, type: "string" }
    ],
    func: (Client, Modules_, req, res) => {
        
        Client.channels.cache.get("846115466018816040").send({
            content: (req.query.message || "<message vide>")
        }).then(msg => {
            res.send({
                status: 200
            })
        }).catch(e => {
            res.send({
                status: 500,
                error: `${e}`,
                stack: e.stack.split("\n")
            })
        })
    } // end func
}