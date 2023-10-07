const messageModel = require("../model/messageModel");

//Store messages in database...
module.exports.addMessage = async (req, res, next) => {
    try {
        const { from, to, message } = req.body;
        const data = await messageModel.create({
            message: { text: message },
            users: [from, to],
            sender: from,
        });
        if (data) {
            return res.json({ msg: "Message added successfully..." });
        } else {
            return res.json({ msg: "Failed to store msg in database..." });
        }
    } catch (ex) {
        next(ex);
    }
}

//Get messages from database...
module.exports.getMessage = async (req, res, next) => {
    try {
        const { from, to } = req.body;
        const message = await messageModel.find({
            users: {
                $all: [from, to],
            },
        }).sort({ updatedAt: 1 });
        const projectedMessages = message.map((msg) => {
            return {
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text,
            };
        });
        res.json(projectedMessages);
    } catch (ex) {
        next(ex);
    }
}