const mongoose = require('mongoose');
const Comment = require('./Comment');
const pdfSchema = new mongoose.Schema({
    userId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    filename: { type: String, required: true },
    uniqueLink: { type: String, required: true },
    comments:[ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],
    uploadDate: { type: Date, default: Date.now },
});

const Pdf = mongoose.model('Pdf', pdfSchema);

module.exports = Pdf;
