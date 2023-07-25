module.exports = {
    parameters: [
        // { name: "description", required: false, type: "string", msg: "Message envoyé lorque ce paramètre est requis mais non fournis"}
    ],
    func: async (Client, Modules_, req, res) => {
        console.log("req.query",req.query)
        return {
            status: 200
        }
    } // end func
}