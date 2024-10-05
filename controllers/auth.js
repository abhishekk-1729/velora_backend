const signUp = (req, res) => {
    const {phone} = req.body
    res.send({"hi":phone})
}

const login = (req, res) => {
    const {whatsappNumber} = req.body
    res.send({"a":whatsappNumber})
}

module.exports = {
    signUp,
    login,

}