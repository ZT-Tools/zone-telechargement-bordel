module.exports = {
    parameters: [
    ],
    func: async (Client, Modules_, req, res) => {
        return {
            api: "http://zone-telechargement-api.ovh/",
            documentation: "http://docs.zone-telechargement-api.ovh/",
            website: "http://www.zone-telechargement-api.ovh/",
        }
    } // end func
}