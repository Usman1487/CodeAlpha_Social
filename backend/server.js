const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { User, Post } = require('./models.js');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));



mongoose.connect('mongodb://127.0.0.1:27017/miniSocialDB')
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));
  

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        res.json({ success: true, userId: user._id, username: user.username });
    } catch (err) { res.status(400).json({ error: "User exists" }); }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) res.json({ success: true, userId: user._id, username: user.username });
    else res.status(400).json({ error: "Invalid credentials" });
});


app.post('/api/posts', async (req, res) => {
    const { userId, username, content } = req.body;
    const post = new Post({ userId, username, content });
    await post.save();
    res.json(post);
});


app.get('/api/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
});


app.post('/api/posts/:id/like', async (req, res) => {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(userId)) {
        post.likes.push(userId);
    } else {
        post.likes.pull(userId);
    }
    await post.save();
    res.json(post);
});


app.post('/api/posts/:id/comment', async (req, res) => {
    const { username, text } = req.body;
    const post = await Post.findById(req.params.id);
    post.comments.push({ username, text });
    await post.save();
    res.json(post);
});

app.listen(3000, () => console.log("Server running on port 3000"));