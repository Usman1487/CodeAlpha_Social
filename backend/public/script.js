let user = null; 

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
   
    let res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
       
        res = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
    }

    const data = await res.json();
    if (data.success) {
        user = data;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('feed-section').style.display = 'block';
        document.getElementById('currentUser').innerText = user.username;
        loadPosts();
    } else {
        alert("Error logging in");
    }
}

async function createPost() {
    const content = document.getElementById('postContent').value;
    await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, username: user.username, content })
    });
    document.getElementById('postContent').value = '';
    loadPosts();
}

async function loadPosts() {
    const res = await fetch('http://localhost:3000/api/posts');
    const posts = await res.json();
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post';
        div.innerHTML = `
            <h3>${post.username}</h3>
            <p>${post.content}</p>
            <div class="actions">
                <button onclick="likePost('${post._id}')">❤️ ${post.likes.length}</button>
            </div>
            <div class="comments">
                ${post.comments.map(c => `<small><b>${c.username}:</b> ${c.text}</small><br>`).join('')}
                <input type="text" placeholder="Add comment" id="comment-${post._id}">
                <button onclick="commentPost('${post._id}')">Reply</button>
            </div>
        `;
        container.appendChild(div);
    });
}

async function likePost(postId) {
    await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId })
    });
    loadPosts();
}

async function commentPost(postId) {
    const text = document.getElementById(`comment-${postId}`).value;
    await fetch(`http://localhost:3000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, text })
    });
    loadPosts();
}