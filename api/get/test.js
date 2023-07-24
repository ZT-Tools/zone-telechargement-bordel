module.exports = {
    parameters: [
        // { name: "description", required: false, type: "string", msg: "Message envoyé lorque ce paramètre est requis mais non fournis"}
    ],
    func: (Client, Modules_, req, res) => {
        res.send({
            status: 200
        })
    } // end func
}