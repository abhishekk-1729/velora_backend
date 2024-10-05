const sendMessage = (req, res) => {
    const {phone} = req.body
    res.send({"hi":phone})
}

const sendWhatsappMessage = (req, res) => {
    const {whatsappNumber} = req.body
    res.send({"a":whatsappNumber})
}

const sendEmail = (req, res) => {
    const {email} = req.body
    res.send({"a":email})
}

module.exports = {
    sendMessage,
    sendWhatsappMessage,
    sendEmail
}